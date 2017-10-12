import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import React, { Component } from 'react';
import { Collapse } from 'antd';
const Panel = Collapse.Panel;
import moment from 'moment';
import { Select, Icon, Button } from 'antd';
const Option = Select.Option;
import CommissionItems from './CommissionItems'


class CommissionTab extends Component {
  constructor() {
    super();
    this.state = {payPeriod:'',
                  role:'',
                  payPeriodMenu :['06/12/2017-06/25/2017','06/26/2017-07/09/2017','07/10/2017-07/23/2017','07/24/2017-08/06/2017','08/07/2017-08/20/2017','08/21/2017-09/03/2017','09/04/2017-09/17/2017'],
                  roleMenu:[{'value':'Ambassador'},
                            {'value':'CAD Closer'},
                            {'value':'Senior Ambassador'},
                            {'value':'Pod Leader'},
                            {'value':'Ambassador Manager'},
                            {'value':'Solar Consultant'}],
                  commissionItems:''
                  };
    this.selectRole = this.selectRole.bind(this);
    this.selectPayPeriod = this.selectPayPeriod.bind(this);
    this.chaching = this.chaching.bind(this);
  }

  selectPayPeriod(value) {
    console.log(`selected ${value}`);
    this.setState({payPeriod:value});
  }
  selectRole(value) {
    console.log(`selected ${value}`);
    this.setState({role:value});
  }
  getAllData(type, start, end){
     console.log('in get all');
     console.log(start);
     console.log(end);
     this.getAllDataPromise(type, start, end)
     .then(response => {
         console.log(response);
         this.setState({
           'commissionItems' : response
         });
     }).catch(er => er)
     .catch(function(error){
         console.log(error);
     })
  }
  getPayPeriods(){
     this.getPayPeriodsPromise()
     .then(response => {
         console.log(response);
         var payPeriodMenu = [];
         response.map( period => payPeriodMenu.push(moment(period['Commission_Start_Date__c']).format('MM/DD/YYYY')+'-'+moment(period['Commission_End_Date__c']).format('MM/DD/YYYY')));
         console.log(payPeriodMenu);
         // this.setState({ payPeriodMenu });
     }).catch(er => er)
     .catch(function(error){
         console.log(error);
     })
  }
   ///////////////////////////  Promises  ///////////////////////////
  getAllDataPromise(type, start, end){
    return new Promise(function(resolve, reject){
      window.CommissionStats.getData(type, start, end, result => {
        resolve(result);
      })
    })
  }
  getPayPeriodsPromise(){
    return new Promise(function(resolve, reject){
      window.CommissionStats.getLICloser(result => {
        resolve(result);
      })
    })
  }

  chaching() {
    console.log('chaching');
    console.log(this.state.payPeriod);
    console.log(this.state.role);
    if (this.state.payPeriod && this.state.role) {
      var data = this.getAllData(this.state.role, this.state.payPeriod.split('-')[0], this.state.payPeriod.split('-')[1]);
      console.log(data);
    }
  }
  componentWillMount() {
     this.getAllData = this.getAllData.bind(this);
     this.getAllDataPromise = this.getAllDataPromise.bind(this);
  }
  componentDidMount(){
    // this.getAllData('Solar Consultant', new Date(1493078400000).toUTCString(), new Date(1494547200000).toUTCString());
    this.getPayPeriods();
  }

  render() {
    return (
        <div>
          <div>
            <Select placeholder="Select Pay Period" style={{ width: 160 }} onChange={this.selectPayPeriod}>
            {this.state.payPeriodMenu && this.state.payPeriodMenu.map( pp => <Option value={pp}>{pp}</Option>)}
            </Select>
            <Select placeholder="Select Role" style={{ width: 160 }} onChange={this.selectRole}>
              {this.state.roleMenu && this.state.roleMenu.map( pp => <Option value={pp['value']}>{pp['value']}</Option>)}
            </Select>
            <Button style={{ marginLeft: 8 }} onClick={this.chaching.bind(this)}>
                ChaChing <Icon type="barcode" />
            </Button>
          </div><br/>
          {
            this.state.payPeriod && this.state.role && this.state.commissionItems && <CommissionItems {...this.state}/>
          }
        </div>
    );
  }
}

export default CommissionTab;