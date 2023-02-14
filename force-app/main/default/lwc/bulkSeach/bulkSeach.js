import { LightningElement, api, wire,track } from 'lwc';
import getObject from '@salesforce/apex/BulkSearchApex.getObject';

import getSearchRecords from '@salesforce/apex/BulkSearchApex.getSearchRecords';
import getFields from '@salesforce/apex/BulkSearchApex.getFields';
export default class BulkSeach extends LightningElement {
    @api objName;
    @api objectFields;
    serchedValues;
    serchedValue;
    // listOfAcounts;
    listOfAcc1 = [];
    
    fields= [];
    tabValue = 5;
    labels = [];
    // tablength = 5;
    // labels = false;
    // listOfAccObj = false;
     fieldValue =[]
     label = [];
    
    @track merged;
   
    labels1 = [];
    colum = [];
    columns = [];
    fieldNames = [];
    connectedCallback(){
      let fieldArray = [];
      console.log('connected call back11');

        if(this.objectFields.includes(',')){
            console.log('connected call back');
            this.objectFields.split(',').forEach(field =>{
                // console.log('field',field);
                fieldArray.push(field);
                // console.log('fieldArray',fieldArray);
            })
        }else{
            fieldArray.push(this.objectFields);
        }
        this.fields = [...fieldArray];
        console.log('this.fields',JSON.stringify(this.fields));
        console.log('fieldArray111',JSON.stringify(fieldArray));
        
        
        getFields({objName : this.objName, fields : fieldArray})
        .then(result =>{
            console.log('result....1111',result);
            let data = result.fieldName;
            console.log('data1111111',result.fieldName);
           if(result){
            console.log('inside of if');
            let colums =[];
            // = [{label : 'Term', fieldName : 'Term'}]
            console.log('result1111',result);
            result.forEach(fields => {
                console.log('fields.........1111',fields);
                let obj = {};
                if(fields.label || fields.fieldName){
                //   if(fields.label == 'Name'|| fields.fieldName == 'Name'){
                    console.log('felds.label........',fields.label);
                    console.log('fields.fieldName',fields.fieldName);
                    obj['label'] = fields.label;
                    obj['fieldName'] =fields.fieldName;
                    obj['type'] = 'url';
           
                }
                else{
                    console.log('else if');
                    obj.label = fields.label;
                    obj.fieldName = fields.fieldName;
                    console.log('sssssssss');
                    // colums.push(obj);
                    // console.log(' this.colums........',this.colums);
                }
                colums.push(obj);
                console.log('colums,,,,,,,,,,,,',JSON.stringify(colums));
            //  }
            });
            this.columns  = colums;
            console.log('this.columns111111',JSON.stringify(this.columns));  
        }
        }).catch(error =>{
            console.log('error....',JSON.stringy(error));
        })
       
    }
   
    handleChange(event){
        this.serchedValue = event.target.value;
        console.log('ssssssss',this.serchedValue);
        this.serchedValues = this.serchedValue.split('\n');
        console.log(' this.serchedValues111', JSON.stringify(this.serchedValues));
        //console.log('ssssssss',JSON.Stringy(this.serchedValues));  
    } 

    tabHandler(event){
        this.tabValue = parseInt(event.target.value);
        console.log(typeof this.tabValue );
        // this.tablength = parseInt(this.tabValue)
        console.log('qqqq',typeof  this.tabValue);
    }
             
    handleSearch(event){
        this.template.querySelectorAll('lightning-textarea').forEach(element => {
            element.reportValidity();
        });
    }
    // objName: this.objName ,objectFields :this.objectFields
    @track listOfAccObj ;
    removeDuplicate1 
    records = [];
    handleSearch(event){
        console.log('objName1111s',typeof this.objName);
    getSearchRecords({searchedValues: this.serchedValues, objFields : this.fields, objName1 : this.objName })
    .then(result => {
       let  data = []
       let searchValue = [];
        console.log('result11111111',result);
         data = result;
        console.log('data',data);
        let listOfAcc = [];
        let listOfAcounts = [];
        //  searchValue = result.serchValue;
        // console.log('searchValue',searchValue);
             data.forEach(acc =>{
                console.log('inside of for');
                if(!listOfAcc.includes(acc.Id)){
                    listOfAcc.push(acc.Id);
                    listOfAcounts.push(acc);
                    console.log('listOfAcounts',listOfAcounts.length);
                }
                });
                this.listOfAccObj = [...listOfAcounts]
                console.log(' this.listOfAccObj', JSON.stringify(this.listOfAccObj));
                this.listOfAccObj.forEach(ele=>{
                    let obj = {};
                    Object.assign(obj,ele.objctRecords);
                    console.log('obj',JSON.stringify(obj));
                    this.records.push(obj);
                    console.log('this.records',JSON.stringify(this.records));
                })
                
    //     let obj = {};
    //     this.merged = this.labels.map((label, i) => 
    //     ({label, 'fieldName' : this.fields[i]}) );
    //     obj.label = 'term';
    //     obj.fieldName = 'term';
    //     obj['term'] = searchValue;
    //     this.merged.push(obj);
    //     console.log('qqqqq',this.merged.length);
    //    console.log('qqqqq',JSON.stringify(this.merged));

        //  let serchData = this.merged.map((term, i)=>({term, 'term': searchValue[i]}))
        //  console.log('serchData',JSON.stringify(serchData));
        // this.merged = [... this.labels]
        
       
       
    //   const data1  = [{ label : 'term ',value :this.serchedValues}, ...this.merged]
    //    console.log(' this.merged', JSON.stringify(data1));
        // console.log('removeDuplicate',removeDuplicate.length);
        // console.log(' this.listOfAcounts', listOfAcounts);
        // console.log(' this.tabValue.length', this.tabValue);
       
        //     for(let i = 0; i < this.tabValue; i++){
        //         console.log('for loop', listOfAcounts[i]);
        //         listOfAcc.push(listOfAcounts[i]);
        //         console.log('this.listOfAcc111',listOfAcc);
        //        }
        //        console.log('this.listOfAcc',listOfAcc.length);
        //        this.listOfAccObj = [...listOfAcc];
        //        console.log('listOfAccObj',this.listOfAccObj.length);
       
        
        //    , BillingCity:this.listOfAcounts[i].BillingCity, Phone:this.listOfAcounts[i].Phone
        // this.listOfAcounts.forEach(ele =>{
       
    })
    .catch(error => {
        this.error = error;
        console.log('this.error',JSON.Stringify(this.error));
    });
   
}
    

}