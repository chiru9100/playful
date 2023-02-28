import { LightningElement,track,api } from 'lwc';
import forgotPassword from '@salesforce/apex/loginRecordApex.forgotPassword';

export default class ResetPassword extends LightningElement {
    newPassword;
    @api email;
    isOpenResetPassword = true;
    openLoginForm = false;

    isPasswordHandler(event){
        this.newPassword = event.target.value;
        console.log('newPassword',this.newPassword);
    }
    savePasswordHandler(){
        forgotPassword({email:this.email, newPassword:this.newPassword})
        .then((result) => {
            console.log('asdfghjm');
         if(result == true && result != undefined){
        console.log('inside of if in reset password component');
            this.isOpenResetPassword = false;
            this.openLoginForm = true;
        //     console.log(' this.openLoginForm ', this.openLoginForm );
            const selectedEvent = new CustomEvent("passwordvaluechange", {
                detail: this.openLoginForm
              });
              this.dispatchEvent(selectedEvent);
      }
    })
    .catch((error) => {
        this.error = error;

        console.log('error1111111-',error);
    })

    }
}