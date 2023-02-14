import { api, LightningElement, track, wire } from 'lwc';
import accountSearch from '@salesforce/apex/BulkSearchController.accountSearch';
const columns = [
    {label: 'Name', fieldName: 'Name', type: 'text'},
    {label: 'Phone', fieldName: 'Phone', type: 'Number'},
    {label: 'Description', fieldName: 'Description', type: 'text'},
    {label: 'Industry', fieldName: 'Industry', type: 'text'},
    {label: 'Website', fieldName: 'Website', type: 'url'}
];

export default class BulkSearch extends LightningElement {
    
    data = [];
    column = columns;
    showTable = false;
    handleButton(){
        this.showTable = true;
        let searchCmp = this.template.querySelector("lightning-textarea");
        // console.log('value: ',searchCmp.value);
        if(searchCmp.value && searchCmp.value !== ''){
            let searchTerms = searchCmp.value.split('\n');
            console.log('searches: ',searchTerms);
            let ids=[];
            accountSearch({searchTerm : searchTerms})
            .then(result =>{
                console.log('result--',result);
                let d =[];
                result.forEach(ele=>{
                    if(!ids.includes(ele.Id)){
                        ids.push(ele.Id);
                        d.push(ele);
                    }
                })
                this.data = [...d];
                console.log('data--',this.data);
            }).catch(error =>{
                console.error('columns error: ', error);
            })
        }else{
            searchCmp.reportValidity();
        }        
    }
}