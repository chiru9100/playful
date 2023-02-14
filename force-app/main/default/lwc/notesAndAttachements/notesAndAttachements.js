import { LightningElement ,wire,track} from 'lwc';
import getContacts from '@salesforce/apex/notewsAndAttachementsApex.getContacts';
import getAttachements from '@salesforce/apex/notewsAndAttachementsApex.getAttachements';

export default class NotesAndAttachements extends LightningElement {
    @track columns=[  
        {
            label: 'Name',
            fieldName: 'Name'
        },
        {
            label: 'Phone',
            fieldName: 'Phone'
        },
        {   type:"button",
             fixedWidth:150,
             label: 'View',
             typeAttributes: {
                 label: 'View',
                 name: 'view',
                 variant: 'brand'
             }
          },
    ];
    contacts;
    error;
    rowId;

    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
        } else if (error) {
            this.error = error;
        }
    }
    handleRowAction(event){

     console.log('this.contacts',this.contacts);
        this.rowId = event.detail.row.Id;
        console.log('rowId',this.rowId);
        getAttachements({ rowId : this.rowId }) 
        .then(result => {
            this.contacts = result;
        })
        .catch(error => {
            this.error = error;
        });
    }
   
}