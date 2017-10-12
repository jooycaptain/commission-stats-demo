import React, { Component } from 'react'
import { ButtonToolbar, ButtonGroup, Button, Table} from 'react-bootstrap';



export default class TabDashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      period : null,
      periods : {today:'TODAY',yesterday:'YESTERDAY',this_week:'THIS WEEK',last_week:'LAST WEEK',this_month:'THIS MONTH',last_month:'LAST MONTH'},
      data: {}};
  }

  componentDidMount(){
    this.getSaleData('today');
  }

  getSaleData(period){

    var p = new Promise((resolve, reject) => {
      window.SalesDashboard.getSummary(period, (res) => resolve(res))
    });
    
    p.then((response) => { 
      console.log(response);
      this.setState({period : period , 'data' : response}); 
    });

    p.catch( (err) =>  {
      console.log('unable to load data, showing dummy data');
      const response = {
        "Kings":{"Employee 1":{"g2gs":3, "sales":1}},
        "Nassau":{"Employee 2":{"g2gs":0, "sales":6},"Employee 3":{"g2gs":6, "sales":5}},
        "Richmond":{"Employee 4":{"g2gs":1, "sales":0}},
        "Western Suffolk":{"Employee 5":{"g2gs":3, "sales":0},"Employee 6":{"g2gs":6, "sales":0}}
      };
      this.setState({period : period , 'data' : response}); 
    });
  }




  render(){

    return( 
      <div  style={{margin: 20}}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonToolbar>
            <ButtonGroup>
              { Object.keys(this.state.periods).map( (value) => {
                  return (<Button active={this.state.period === value} onClick={() => this.getSaleData(value)} key={value}>{this.state.periods[value]}</Button>)
                })
              }
            </ButtonGroup>
          </ButtonToolbar>
        </div>
        {Object
          .keys(this.state.data)
          .map( (region, num) => {
            var totalGG = 0;
            var totalCAD = 0;
            var totalSale = 0;
            var totalCloser = 0;
            return (
            <div key={num}>
              <br/>
              <h3>{region}</h3>
                <Table responsive hover> 
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }} >Consultant</th>
                      <th style={{ width: "20%" }} ># of G2Gs</th>
                      <th style={{ width: "20%" }} ># of CAD Meetings</th>
                      <th style={{ width: "20%" }} ># of sales</th>
                      <th style={{ width: "20%" }} ># of Closer Meetings</th>
                    </tr>
                  </thead>
                  <tbody>
                  {Object
                    .keys(this.state.data[region])
                    .map( (employee, num) => {
                      totalGG += this.state.data[region][employee]['g2gs'];
                      totalCAD += this.state.data[region][employee]['cadAssigns'];
                      totalSale += this.state.data[region][employee]['sales'];
                      totalCloser += this.state.data[region][employee]['closerAssigns'];
                      return (
                        <tr key={num}>
                          <td>{employee}</td>
                          <td>{this.state.data[region][employee]['g2gs']}</td>
                          <td>{this.state.data[region][employee]['cadAssigns']}</td>
                          <td>{this.state.data[region][employee]['sales']}</td>
                          <td>{this.state.data[region][employee]['closerAssigns']}</td>
                        </tr>
                      )
                    })
                  }
                  <tr>
                    <td>Total</td>
                    <td>{totalGG}</td>
                    <td>{totalCAD}</td>
                    <td>{totalSale}</td>
                    <td>{totalCloser}</td>
                  </tr>
                  </tbody>
                </Table>
            </div>)
          })
        }
      </div>
    )
  }

}