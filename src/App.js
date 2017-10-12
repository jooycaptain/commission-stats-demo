import React, { Component } from 'react';
import './App.css';
import enUS from 'antd/lib/locale-provider/en_US';
import { Tabs, Button } from 'antd';

import TabDashboard from './components/TabDashboard'
import TabOutcomes from './components/TabOutcomes'
import CommissionTab from './CommissionTab'


const TabPane = Tabs.TabPane;
const operations = <Button style={{ "marginTop": "3px"}}><a href="https://levelsolar.my.salesforce.com/home/home.jsp" >Back To SalesForce</a></Button>;

class App extends Component {

  render() {
    return(
      <div>
          <Tabs tabBarExtraContent={operations}>
            <TabPane tab="Dashboard" key="Dashboard"><TabDashboard/></TabPane>            
            <TabPane tab="CADs" key="Cad Outcomes"><TabOutcomes outcomeType={"cad"}/></TabPane>            
            <TabPane tab="Closers" key="Closer Outcomes"><TabOutcomes outcomeType={"closer"}/></TabPane>            
            <TabPane tab="Commission" key="Commission"><CommissionTab/></TabPane>            
          </Tabs>
      </div>
    )
  }
}

export default App;
