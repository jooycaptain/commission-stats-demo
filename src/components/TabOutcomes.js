import React, { Component } from 'react'
import { ButtonToolbar, ButtonGroup, Tooltip, OverlayTrigger, Popover, Button, Glyphicon, Table} from 'react-bootstrap';
import moment from 'moment';


class TabOutcomes extends Component{

  constructor(props) {
    super(props);
    this.state = {outcomeType: this.props.outcomeType, 
      outcomeSet: null, 
      period : null,
      periods : {today:'TODAY',yesterday:'YESTERDAY',this_week:'THIS WEEK',last_week:'LAST WEEK',this_month:'THIS MONTH',last_month:'LAST MONTH'},
      outcome: null, 
      showDetails: false,
      regionDetails: null,
      outcomeDetails: null,
      note: "click on table entries for additional details",
      noteHide: null,
      data: {}, 
      details:[]};
  }

  componentDidMount(){
    this.getSaleData('today');
  }

  removeDetails(){
    this.setState({
      details : [], 
      note: "click on table entries for additional details", 
      noteHide : null, 
      outcomeDetails : null, 
      regionDetails : null});
  }

  selectRegion(region){
    this.setState({region : region});
  }

  selectOutcome(outcome){
    this.setState({outcome : outcome});
  }
 
  getSaleData(period){

    var p = new Promise((resolve, reject) => {
      window.SalesDashboard.getInteractionSummary(this.state.outcomeType, period, (res) => resolve(res))
    });
    
    this.removeDetails()
    p.then((response) => { 
      console.log(response);
      var outcomeSet = {};

      //renaming null outcomes values and building an outcome set
      Object.keys(response).map( (region) => {
        if ('null' in response[region]){
          response[region]['No Outcome'] = response[region]['null'];
          delete response[region]['null'];
        }

        Object.keys(response[region]).map( (outcome) => {   
          outcomeSet[outcome]=true;
        })

      })

      this.setState({
        period : period, 
        details : [], 
        note: "click on table entries for additional details", 
        noteHide : null, 
        outcomeDetails : null,
        data : response, 
        outcomeSet: outcomeSet});
    });

    p.catch( (err) =>  {
      console.log('unable to load data, showing dummy data');
    });


  }

  getInteractionDetails(region,outcome){
    if (!region || !outcome || this.state.data[region][outcome]){
      var p = new Promise((resolve, reject) => {
        window.SalesDashboard.getInteractionDetails([this.state.outcomeType], this.state.period, outcome, region, null, (res) => resolve(res))
      });
      
      p.then((response) => { 
        console.log(response);
        const note = 'showing below ' + (outcome ? outcome : 'outcomes') +  ' in ' + (region ? region : 'all regions');
        this.setState({details : response, note : note, noteHide : 'hide details', outcomeDetails : outcome, regionDetails : region});
      });
    }
  }


  showData(){
    if (this.state.outcomeSet) {
      return ( 
        <Table responsive>
          <thead>
            <tr>
            <th></th>
            {Object.keys(this.state.data).map( (region) => 
              {
                var backgroundColorRegion = (this.state.outcomeDetails === null && this.state.regionDetails === region) ? "#bce6ff" : "#ffffff";
                return (<th 
                key={region}
                onClick={() => this.getInteractionDetails(region, null) }
                style={{ textAlign: "center", backgroundColor: backgroundColorRegion }}>{region}
                </th>)}
              )}
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.state.outcomeSet).map( (outcome) => {
              var backgroundColorOutcome = (this.state.outcomeDetails === outcome && this.state.regionDetails === null) ? "#bce6ff" : "#ffffff";
              return (
                  <tr key={outcome}>
                    <td style={{ backgroundColor: backgroundColorOutcome }} onClick={() => this.getInteractionDetails(null, outcome)}><b>{outcome}</b></td>
                    {
                      Object.keys(this.state.data).map( (region) => {
                        var backgroundColor = (
                          (this.state.outcomeDetails === outcome && this.state.regionDetails === region) ||
                          (this.state.outcomeDetails === null && this.state.regionDetails === region) ||
                          (this.state.outcomeDetails === outcome && this.state.regionDetails === null)) ? "#bce6ff" : "#ffffff";
                        return (<td 
                        key={region+outcome}
                        style={{ textAlign: "center", backgroundColor: backgroundColor }}
                        onClick={() => this.getInteractionDetails(region, outcome)}> {this.state.data[region][outcome]} 
                        </td>)
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      )
    }
  }

  showDetails(){

    if (this.state.details && (this.state.details.length > 0)){
      
      return (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Customer</th>
              {(this.state.regionDetails === null) ? <th>Region</th> : null}
              {(this.state.outcomeDetails === null) ? <th>Outcome</th> : null}
              <th>Address</th>
              <th>Assigned to</th>
              <th>{(this.state.outcomeType === 'cad') ? <th>Closer</th> : <th>Setter</th>}</th>
              <th>Date and Time</th>
            </tr>
          </thead>
          <tbody>
          {this.state.details.map( (value) => {            
            const house = <Tooltip id="houseTooltip" >maps</Tooltip>; 
            const notes = <Tooltip id="notesTooltip" ><b>Notes: </b>{value.Notes__c}</Tooltip>; 
            const csrNotes = <Tooltip id="csrNotesTooltip"><b>CSR Notes: </b>{value.CommentsFreeText__c}</Tooltip>;

            var customerName, customerAddress, region, setterCloser;

            if (this.state.outcomeType === 'cad'){
              customerName = value['Contact__r']['Name']
              customerAddress = value['Opportunity__r']['Contact_Opp__r']['LASERCA__Home_Address__c'] + ', ' + value['Opportunity__r']['Contact_Opp__r']['LASERCA__Home_City__c'] + ' ' + value['Opportunity__r']['Contact_Opp__r']['LASERCA__Home_Zip__c'];
              region = value['Opportunity__r']['ZipCodeRegion__r']['Name']
              if (value['Opportunity__r']['SalesRepE__r'])
                setterCloser = value['Opportunity__r']['SalesRepE__r']['Name']
            }
            else{
              customerName = value['Lead__r']['Name']
              customerAddress = value['Lead__r']['LASERCA__Home_Address__c'] + ', ' + value['Lead__r']['LASERCA__Home_City__c'] + ' ' + value['Lead__r']['LASERCA__Home_Zip__c'];
              region = value['Lead__r']['Name']
              if (value['Setter__r'])  
                setterCloser = value['Setter__r']['Name']
            }

            return (
                  <tr key={value.Id} >
                    <td><a href={"https://levelsolar.my.salesforce.com/" + value.Id}><i>{customerName}</i></a></td>
                    {(this.state.regionDetails === null) ? <td>{region}</td> : null}
                    {(this.state.outcomeDetails === null) ? <td>{value.Outcome__c}</td> : null}
                    <td><OverlayTrigger placement="top" overlay={house}><Glyphicon glyph="glyphicon glyphicon-home"/></OverlayTrigger> &nbsp;{customerAddress}</td>
                    <td>{value.Assigned_To__r ? value.Assigned_To__r.Name : '-'}</td>
                    <td><OverlayTrigger placement="top" overlay={notes}><Glyphicon glyph="glyphicon glyphicon-pencil"/></OverlayTrigger> &nbsp;<OverlayTrigger  placement="top" overlay={csrNotes}><Glyphicon glyph="glyphicon glyphicon-book" /></OverlayTrigger> &nbsp;{setterCloser}</td>
                    <td>{moment(value.InteractionDate__c).format('MM/DD - hh:mm a')}</td>
                  </tr>
                  )
              })
            }
          </tbody>
        </Table>
      )
    }
  }


  render(){
    return(
        <div  style={{margin: 20}}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ButtonToolbar>
              <ButtonGroup>
                {Object.keys(this.state.periods).map( (value) => <Button active={this.state.period === value} onClick={() => this.getSaleData(value)} key={value} value={value}>{this.state.periods[value]}</Button>)}
              </ButtonGroup>
            </ButtonToolbar>  
          </div>
          <br/>
          { this.showData() }
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span>{ this.state.note } <a onClick={this.removeDetails.bind(this)}><i>{ this.state.noteHide }</i></a></span>
          </div>
          <br/>
          { this.showDetails() }
          <br/>
        </div>
    )
  }

}

export default TabOutcomes;