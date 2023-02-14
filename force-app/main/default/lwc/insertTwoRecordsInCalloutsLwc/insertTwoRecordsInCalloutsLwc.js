import { LightningElement } from 'lwc';
import getRecords from '@salesforce/apex/insertTwoRecordsInCallouts.getRecords'
export default class InsertTwoRecordsInCalloutsLwc extends LightningElement {

    firstName;
    lastName;
    phone;
    email;

    firstNameHandler(event){
        this.firstName = event.target.value;
    }
    lastNameHandler(event){
        this.lastName = event.target.value;
    }
    phoneHandler(event){
        this.phone = event.target.value;

    }
    emailHandler(event){
        this.email = event.target.value;
    }
    integrateHandker() {
        var inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
               
            }
            
        });
    getRecords({firstName: this.firstName, lastName:this.lastName,email:this.email, phone :this.phone})
        .then((result) => {
            this.contacts = result;
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.contacts = undefined;
        });
    }
}