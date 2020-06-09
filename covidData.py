# dependencies
import pandas as pd
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, join, outerjoin, MetaData, Table

class CovidData():

    def __init__(self, connect_string):
        self.engine = create_engine(connect_string)
        # self.conn = self.engine.connect()
        self.connect_string = connect_string
        self.inspector = inspect(self.engine)
        self.tables = self.inspector.get_table_names()
        self.Base = automap_base()
        self.Base.prepare(self.engine, reflect=True)
        self.Cases = self.Base.classes['COVID_FINAL_DATA']  #### TABLE NAME
        self.meta = MetaData()
        # this is how to see a view
        # self.TestResults = Table('test_results_view', self.meta, 
        #             autoload_with=self.engine)


    def display_db_info(self):
        # Make sure your initialization put in correct data
        inspector = inspect(self.engine)
        tables = self.inspector.get_table_names()
        for table in self.tables:
            print("\n")
            print('-' * 12)
            print(f"table '{table}' has the following columns:")
            print('-' * 12)
            for column in self.inspector.get_columns(table):
                print(f"name: {column['name']}   column type: {column['type']}")


    def get_state_ids(self):
        session = Session(self.engine)

        results = session.query(self.Cases.State_Abbrev)
            
        df = pd.read_sql(results.statement, session.connection())

        session.close()  
        return list(df.State_Abbrev.unique())  


    def get_cases(self, state_name=""):
        session = Session(self.engine)

        if state_name == "":
            results = session.query(self.Cases)
        else:
            results = session.query(self.Cases).filter(self.Cases.State_Abbrev == state_name)    
            
        df = pd.read_sql(results.statement, session.connection())
        
        session.close()  
        df = df.dropna()
        return df.to_dict(orient="records")     


    def get_deaths(self, date_stamp="2020-06-07"):
        session = Session(self.engine)

        if date_stamp == "":
            results = session.query(self.Cases)
        else:
            results = session.query(self.Cases).filter(self.Cases.Date == date_stamp)    
            
        df = pd.read_sql(results.statement, session.connection())
        
        session.close()  
        df = df.dropna()
        return df.to_dict(orient="records")     

    # def get_test_results(self, state_name=""): 
    #     session = Session(self.engine)

    #     if state_name == "":
    #         results = session.query(self.Cases)
    #     else:
    #         results = session.query(self.Cases) #.filter_by(self.Cases.State_Abbrev == state_name)    
            
    #     df = pd.read_sql(results.statement, session.connection())

    #     session.close()  
    #     return df.to_dict(orient="records")    

    # def get_data_by_user(self, state_name="AK"):
    #     return {
    #         'user': self.get_cases(state_name)[0],
    #         'results': self.get_test_results(state_name)
    #     }               


if __name__ == '__main__':
    info = CovidData("sqlite:///covidData.db")
    info.display_db_info()
    print("\nState\n", info.get_state_ids())
    print("\n\nCASES\n", info.get_cases())
    print("\nState TX:\n", info.get_cases("TX"))
    # print("\nState CA:\n", info.get_test_results(1286))
    # print("\nData for TX:\n", info.get_data_by_user(1286))



        