import { LightningElement } from 'lwc';
import getresposnsefromCallout from '@salesforce/apex/callouts.getresposnsefromCallout';
export default class CalloutExample extends LightningElement {
    name;
    phone;
    onChangeHandler(event){
        this.name = event.target.value;
        console.log(' this.Name ', this.name);
    }
    onChangeHandlerPhone(event){
        this.phone = event.target.value;
        console.log(' this.Name ', this.phone);

    }
    submitHandler() {
       
        var inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
               
            }
            
        });
        getresposnsefromCallout({name: this.name, phone :this.phone})
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