import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import React, { Component } from 'react';
import { Collapse, notification } from 'antd';
const Panel = Collapse.Panel;
import moment from 'moment';
import Mousetrap from 'mousetrap';

const openNotificationWithIcon = (type,title,description) => {
  notification[type]({
    message: title,
    description: description,
    duration: 5,
  });
};

const selectRowProp = {
  mode: 'checkbox',
  bgColor: '#4a9de2', // you should give a bgcolor, otherwise, you can't regonize which row has been selected
  hideSelectColumn: true,  // enable hide selection column.
  clickToSelect: true  // you should enable clickToSelect, otherwise, you can't select column.
};

var IndividualCommission = React.createClass({

  render() {
  	let p = this.props
	return (
	  	<BootstrapTable data={ this.props.commissionOnePerson } selectRow={ selectRowProp } exportCSV={ true }>
	    	<TableHeaderColumn dataField='employeeName' csvHeader='Employee Name' filter={ { type: 'TextFilter', delay: 50 } }>Employee Name</TableHeaderColumn>
	    	<TableHeaderColumn dataField='contactName' csvHeader='Contact Name' isKey filter={ { type: 'TextFilter', delay: 50 } }>Contact Name</TableHeaderColumn>
	    	<TableHeaderColumn dataField='description' csvHeader='Contact Address' filter={ { type: 'TextFilter', delay: 50 } }>Description</TableHeaderColumn>
	    	<TableHeaderColumn dataField='eventDate' csvHeader='Event Date' filter={ { type: 'TextFilter', delay: 50 } }>Date</TableHeaderColumn>
	    	<TableHeaderColumn dataField='eventType' csvHeader='Event Type' filter={ { type: 'TextFilter', delay: 50 } }>Type</TableHeaderColumn>
	  	</BootstrapTable>
	);
	}
});
const teirString = {
	'CAD Closer':{
		'1': 'CAD1',
		'2': 'CAD2',
		'3': 'CAD3',
		'4': 'CAD4',
		'5': 'CAD5',
		'6': 'CAD6',
		'7': 'CAD7'
	},
	'Solar Consultant':{
		'1':'LSL1',
		'2':'LSL2',
		'3':'LSL3'
	},
	'Ambassador':{
		'0':'AMB'
	},
	'Senior Ambassador':{
		'0':'SENIOR_AMB'
	},
	'Pod Leader':{
		'0':'POD_LEADER'
	},
	'Ambassador Manager':{
		'0':'Ambassador_Manager__c'
	}
}
const rateTable = {
  'CAD Closer': {
  	hasTier: true,
  	lowerBound: [[0,'1'],
  				 [5,'2'],
  				 [10,'3'],
  				 [15,'4'],
  				 [20,'5'],
  				 [25,'6'],
  				 [30,'7']],
  	tpsRate: {'1':7.5,
  			  '2':15,
  			  '3':18.75,
  			  '4':22.5,
  			  '5':24,
			  '6':25.5,
			  '7':27},
	installRate: {'1':2.5,
				  '2':5,
				  '3':6.25,
				  '4':7.5,
				  '5':8,
				  '6':8.5,
				  '7':9},
	sitRate: false,
	tpsSelf: false,
	installSelf: false
  },
  'Solar Consultant': {
  	hasTier: true,
  	lowerBound: [[0,'1'],
  				 [6,'2'],
  				 [9,'3']],
  	tpsRate: {'1':125,
  			  '2':150,
  			  '3':200},
	installRate: {'1':200,
				  '2':200,
				  '3':250},
	sitRate: false,
	tpsSelf: {'0':300,
  			  '1':300,
  			  '2':300,
  			  '3':300},
	installSelf: {'0':600,
  			  '1':600,
  			  '2':600,
  			  '3':600}
  },
  'Ambassador': {
  	hasTier: false,
  	tpsRate: {'0':70},
	installRate: {'0':25},
	sitRate: {'0':25},
	tpsSelf: false,
	installSelf: false
  },
  'Senior Ambassador': {
  	hasTier: false,
  	tpsRate: {'0':100},
	installRate: {'0':40},
	sitRate: {'0':25},
	tpsSelf: false,
	installSelf: false
  },
  'Pod Leader': {
  	hasTier: false,
  	tpsRate: {'0':0},
	installRate: {'0':0},
	sitRate: {'0':8},
	tpsSelf: false,
	installSelf: false
  },
  'Ambassador Manager': {
  	hasTier: false,
  	tpsRate: {'0':0},
	installRate: {'0':0},
	sitRate: {'0':8},
	tpsSelf: false,
	installSelf: false
  }
};

class CommissionItems extends Component {
	constructor() {
		super();
		this.state = {hasTier:false,tier:0,tpsRate:0,installRate:0,sitRate:0,employeeList:[],totalCommissions:[]};
	}

	// concatTotal(count,desctiption,employName,myTier,rateType,type,payPeriod,employLocation){
	// 	let item = [{'eventType':type,'employeeName':employName,'description':count+desctiption+rateTable[this.props.role][rateType][myTier],'Amount':count*rateTable[this.props.role][rateType][myTier],'payPeriod':payPeriod,'employLocation':employLocation}]
	// 	return item
	// }

	checkCompanyLead(items) {
		return items['isCompanyLead'];
	}
	checkNotCompanyLead(items) {
		return !items['isCompanyLead'];
	}

	getWeekString(items) {
		var weekString = moment(items.eventDate).year().toString()+moment(items.eventDate).isoWeek().toString()
		return weekString
	}

	createData(startDate, endDate, period, type, itemList){
		console.log('in createDate');
		console.log(startDate);
		console.log(endDate);
		this.createDataPromise(startDate, endDate, period, type, itemList)
		.then(response => {
			console.log(response);
			console.log('Done!!');
		}).catch(er => er)
		.catch(function(error){
			console.log(error);
		})
	}

	///////////////////////////  Promises  ///////////////////////////
	createDataPromise(startDate, endDate, period, type, itemList){
		return new Promise(function(resolve, reject){
		  window.CommissionStats.insertCommissionItems(startDate, endDate, period, type, itemList, result => {
		    resolve(result);
		  })
		})
	}

	commissionRunItem(commissionItem, type, rate, employee) {				
		var weekKey = this.getWeekString(commissionItem)

		// console.log(this.state.employeeTier[employee][weekKey])
		if (this.state.employeeTier[employee][weekKey] || !rateTable[this.props.role]['hasTier']) {
			var leadId = ''
			var oppId = ''
			if (type == 'Sit') {
				leadId = commissionItem['leadId']
			} else {
				oppId = commissionItem['opportunityId']
			}
			let typeCount = type + 'Count'
			let typeTier = type + 'Tier'
			var weekSale = rateTable[this.props.role]['hasTier'] ? this.state.employeeTier[employee][weekKey][typeCount] : 'NA'
			var tier = weekSale == 'NA' ? '0' : this.state.employeeTier[employee][weekKey][typeTier]
			var tierStr = (!commissionItem['isCompanyLead'] && this.props.role === 'Solar Consultant') ? teirString[this.props.role][tier].substring(1) : teirString[this.props.role][tier];
			if (weekSale == 'NA') {
				weekSale = '0'
			}
			let amount = rate[tier]
			console.log(rate[tier])
			if (this.props.role == 'Solar Consultant'){ 
				if (['Western Suffolk','Eastern Suffolk','Nassau'].indexOf(this.props.commissionItems[employee]['employeeLocation']) > -1) {
					console.log(this.props.commissionItems[employee]['employeeLocation'])
					console.log(employee);
					if (!commissionItem['isCompanyLead']) {
						amount = 800
					} else {
						amount = 300
					}
				}
			}//LI special rates
			if (this.props.role == 'CAD Closer' && ['a027000000KTGuLAAX','a027000000QJmuEAAT','a023900000UiZR5AAN','a023900000Ui9sBAAR'].indexOf(commissionItem['employeeId']) == -1) {
				return null; 
			}//Filter CAD Closer
			console.log(this.props.commissionItems[employee]['employeeLocation'])
			console.log(amount)
			var item = { 'Amount__c':amount,
						 'Customer_Name__c':commissionItem['contactName'],
						 'Description__c':commissionItem['description'],
						 'Employee__c':commissionItem['employeeId'],
						 'Lead__c':leadId,
						 'Opportunity__c':oppId,
						 'TierString__c':tierStr,
						 'Type__c':type.replace('Solar Consultant','Closers'),
						 'WeekSales__c':weekSale,
						 'WeekKey__c':weekKey}
			return item;
		} else {
			return null;
		}
	}

	createCommission() {
		openNotificationWithIcon('info','Creating commission items...','This message only shows to the right person.');
		console.log('In commissionRun');
		let p = this.props
		let role = this.props.role
		let item
		let parsedItem
		var totalCommissionRun = [];
		for (var employee in p.commissionItems) {
			var employeeLocation = p.commissionItems[employee]['employeeLocation'];
			for (var i = 0; i < p.commissionItems[employee]['permits'].length; i++) {
				var permit = p.commissionItems[employee]['permits'][i]
				if (rateTable[role]['hasTier']) {
					parsedItem = !permit['isCompanyLead'] && role == 'Solar Consultant' ? this.commissionRunItem(permit,permit['eventType'],rateTable[role]['tpsSelf'],employee) : this.commissionRunItem(permit,permit['eventType'],rateTable[role]['tpsRate'],employee);
					// parsedItem = !permit['isCompanyLead'] && this.commissionRunItem(permit,permit['eventType'],rateTable[role]['tpsRate'],employee);	
				} else {					
					parsedItem = this.commissionRunItem(permit,permit['eventType'],rateTable[role]['tpsRate'],employee);
				}
				parsedItem && parsedItem['Amount__c'] && totalCommissionRun.push(parsedItem);
			}
			for (var i = 0; i < p.commissionItems[employee]['installs'].length; i++) {
				var install = p.commissionItems[employee]['installs'][i]
				if (rateTable[role]['hasTier']) {
					parsedItem = !install['isCompanyLead'] && role == 'Solar Consultant' ? this.commissionRunItem(install,install['eventType'],rateTable[role]['installSelf'],employee) : this.commissionRunItem(install,install['eventType'],rateTable[role]['installRate'],employee);
					// parsedItem = !install['isCompanyLead'] && this.commissionRunItem(install,install['eventType'],rateTable[role]['installRate'],employee);	
				} else {
					parsedItem = this.commissionRunItem(install,install['eventType'],rateTable[role]['installRate'],employee);
				}
				parsedItem && parsedItem['Amount__c'] && totalCommissionRun.push(parsedItem);
			}
			for (var i = 0; i < p.commissionItems[employee]['sits'].length; i++) {
				if (!rateTable[role]['hasTier']) {
					var sit = p.commissionItems[employee]['sits'][i]
					parsedItem = this.commissionRunItem(sit,sit['eventType'],rateTable[role]['sitRate'],employee);
					parsedItem && parsedItem['Amount__c'] && totalCommissionRun.push(parsedItem);
				}
			}
		}
		console.log(totalCommissionRun);
		let startDate = this.props.payPeriod.split('-')[0];
		let endDate = this.props.payPeriod.split('-')[1];
		console.log(moment(startDate).toDate().toUTCString());
		console.log(moment(endDate).toDate().toUTCString());
		this.createData(moment(startDate).toDate().toUTCString(), moment(endDate).toDate().toUTCString(), 'Bi-Weekly',role,totalCommissionRun);
		openNotificationWithIcon('success','Commission items created!','This message only shows to the right person.');
	}

	getTier(count, role){
		var myTier = '0';
		if (rateTable[role]['hasTier']) {
			for (var tier of rateTable[role]['lowerBound']) {
				if (count >= tier[0]) {
					myTier = tier[1];
				}
			}
		}
		return myTier
	}
	
	commissionAppendTotal(role, count, desctiption, employeeName, myTier,rateType,type,payPeriod,employeeLocation) {
		let item = null;
		if (rateTable[role][rateType] && count) {
			let rate = rateTable[role][rateType][myTier]
			if (role == 'Solar Consultant'){
				rate = ['Western Suffolk','Eastern Suffolk','Nassau'].indexOf(employeeLocation) > -1 ? (rateType.search('Self') > 0 ? 800 : 300) : rateTable[role][rateType][myTier]
			}
			let item = [{'eventType':type,'employeeName':employeeName,'description':count+desctiption+rate,'Amount':count*rate,'payPeriod':payPeriod,'employeeLocation':employeeLocation}]
		}
		return item
	}

	calculateCommission(commissionItems, role) {
		var employeeList = [];
		var employeeTier = {};
		var totalCommissions = [];
		for (var employee in commissionItems) {
			var sitNo = commissionItems[employee]['sits'].length;
			var installNo = commissionItems[employee]['installs'].length;
			var permitNo = commissionItems[employee]['permits'].length;
			var employeeLocation = commissionItems[employee]['employeeLocation']

			if (!rateTable[role]['hasTier']) {
				employeeList.push(employee+'-'.repeat(40-employee.length)+'>    '+sitNo+' Sits; '+permitNo+' Permits Submitted; '+installNo+' Installs Completed');
				
				employeeTier[employee] = {'Install':'0','Permit':'0'};
				totalCommissions.concat(this.commissionAppendTotal(role, installNo, ' Installs Completed @ $', employee, '0','installRate','Installed',this.props.payPeriod,employeeLocation))
				totalCommissions.concat(this.commissionAppendTotal(role, permitNo, ' Permit Submitted @ $', employee, '0','tpsRate','Permit Submitted',this.props.payPeriod,employeeLocation))
				totalCommissions.concat(this.commissionAppendTotal(role, sitNo, ' Sits @ $', employee, '0','sitRate','Sit',this.props.payPeriod,employeeLocation))
			} else {
				employeeList.push(employee+'-'.repeat(40-employee.length)+'>    '+permitNo+' Permits Submitted; '+installNo+' Installs Completed');
				var startDate = this.props.payPeriod.split('-')[0];
				var endDate = this.props.payPeriod.split('-')[1];
				var weekTier = {}
				for (var m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
					var weekString = m.year().toString() + m.isoWeek().toString()
				  	weekTier[weekString] = {'TPSCount':0,'InstallCount':0};
				}
				employeeTier[employee] = weekTier
				for (var week in weekTier) {
					employeeTier[employee][week]['TPSCount'] = commissionItems[employee]['permits'].filter(item => this.getWeekString(item) == week).length;
					employeeTier[employee][week]['InstallCount'] = commissionItems[employee]['installs'].filter(item => this.getWeekString(item) == week).length;
					var installSelfNo = role == 'Solar Consultant'? commissionItems[employee]['installs'].filter(item => this.getWeekString(item) == week && this.checkNotCompanyLead(item)).length : 0;
					var permitSelfNo = role == 'Solar Consultant'? commissionItems[employee]['permits'].filter(item => this.getWeekString(item) == week && this.checkNotCompanyLead(item)).length : 0;
					if (role == 'Solar Consultant') {
						employeeTier[employee][week]['TPSTier'] = this.getTier(employeeTier[employee][week]['TPSCount'], role);
					} else {
						employeeTier[employee][week]['TPSTier'] = this.getTier(commissionItems[employee]['sales'].filter(item => this.getWeekString(item) == week).length, role);
					}
					employeeTier[employee][week]['InstallTier'] = employeeTier[employee][week]['TPSTier']
					
					var weekOf = 'Week Of '+moment().day("Monday").year(week.substring(0,4)).isoWeek(week.substring(4)).format('MM/DD/YYYY').toString()
					totalCommissions.concat(this.commissionAppendTotal(role, installSelfNo, ' Installs Completed @ $', employee, '0','installSelf','Installed',weekOf,employeeLocation))
					totalCommissions.concat(this.commissionAppendTotal(role, permitSelfNo, ' Permit Submitted @ $', employee, '0','tpsSelf','Permit Submitted',weekOf,employeeLocation))
					totalCommissions.concat(this.commissionAppendTotal(role, employeeTier[employee][week]['InstallCount'] - installSelfNo, ' Installs Completed @ $', employee, employeeTier[employee][week]['InstallTier'],'installRate','Installed',weekOf,employeeLocation))
					totalCommissions.concat(this.commissionAppendTotal(role, employeeTier[employee][week]['TPSCount'] - permitSelfNo, ' Permit Submitted @ $', employee, employeeTier[employee][week]['TPSTier'],'tpsRate','Permit Submitted',weekOf,employeeLocation))
				}				
			}
			this.setState({employeeList,totalCommissions,employeeTier});
		}
	}

	dateFormat(commissionList) {
		for (var commission of commissionList) {
			commission['eventDate'] = moment(commission['eventDate']).format('MM/DD/YYYY');
		}
		return commissionList;
	}

	componentWillReceiveProps(props) {
		console.log('commissionItems recives props');
		this.calculateCommission(props.commissionItems, props.role);
		// this.xyz(props.commissionItems, props.role);
	}

	componentDidMount(){
		console.log('commissionItems did mount');
		Mousetrap.bind([`up up down down left right left right b a`], this.createCommission.bind(this));
		this.calculateCommission(this.props.commissionItems, this.props.role);
		// this.xyz(this.props.commissionItems, this.props.role);
	}

	componentWillUnmount() {
	  	Mousetrap.unbind([`up up down down left right left right b a`], this.createCommission.bind(this));
	}

	render() {

		return (
		  	<Collapse accordion style={{'background':'#ffffff'}}>
			  	<Panel header={'Summary'} key='Summary'>
			  		<BootstrapTable data={ this.state.totalCommissions } selectRow={ selectRowProp } exportCSV={ true } csvFileName={`${this.props.payPeriod}-${this.props.role}-commissions`}>
				    	<TableHeaderColumn  dataField='employeeName' csvHeader='Employee Name' isKey filter={ { type: 'TextFilter', delay: 50 } }>Employee Name</TableHeaderColumn>
				    	<TableHeaderColumn  width='80' dataField='Amount' csvHeader='Amount'>Amount</TableHeaderColumn>
				    	<TableHeaderColumn dataField='description' csvHeader='Description'>Description</TableHeaderColumn>
				    	<TableHeaderColumn dataField='payPeriod' csvHeader='Pay Period' filter={ { type: 'TextFilter', delay: 50 } }>Date</TableHeaderColumn>
				    	<TableHeaderColumn dataField='employeeLocation' csvHeader='Employee Region' filter={ { type: 'TextFilter', delay: 50 } }>Region</TableHeaderColumn>
				  	</BootstrapTable>
			  	</Panel>
		  		{
		  			this.state.employeeList && this.state.employeeList.map( 
		  				employee => {
		  				var employeeName = employee.split('--')[0];
		  				var interactionList = [];
		  				interactionList = interactionList.concat(this.dateFormat(this.props.commissionItems[employeeName]['sits']));
		  				interactionList = interactionList.concat(this.dateFormat(this.props.commissionItems[employeeName]['installs']));
		  				interactionList = interactionList.concat(this.dateFormat(this.props.commissionItems[employeeName]['permits']));
		  				return (
		  					<Panel header={employee} key = {employee}>
		  						<IndividualCommission commissionOnePerson={interactionList} />
		  					</Panel>
		  				)
		  			})
		  		}
		  	</Collapse>
		);
	}
}

export default CommissionItems;