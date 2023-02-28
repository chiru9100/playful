
import { LightningElement,track,api } from 'lwc';
import createUser from '@salesforce/apex/loginRecordApex.createUser';
import isEmailExist from '@salesforce/apex/loginRecordApex.isEmailExist';


export default class RegisterForm extends LightningElement {
    firstName;
    lastName;
    email;
    phone;
    password;
    companyName;
    emailError1

  openLoginForm =false;
    openRegister = true;
    // registerHandler(event){
    //     this.openRegister = true;
    // }
    firstNameEvent(event){
        this.firstName = event.target.value;
    }
    lastNameEvent(event){
        this.lastName = event.target.value;

    }
    emailEvent(event){
        this.email = event.target.value;

    }
    phoneEvent(event){
        this.phone = event.target.value;

    }
    passwordEvent(event){
        this.password = event.target.value;


    }
    companyEvent(event){
        this.companyName = event.target.value;


    }
    userEventHandler(event){
        this.userName = event.target.value;
    }
    isParentOpen = false;
    handleSubmit(event){
        
        
        isEmailExist({username :this.userName})
        .then((result) => {
            console.log('submit');
            if(result != null && result != undefined && result == true){
                this.openRegister=true;

                this.openLoginForm=false;
                 console.log('inside of email match');
                this.emailError1 = 'Your username already exists somewhere on the  Salesforce Ecosystem.';
               
            } else {
                createUser({firstName : this.firstName,lastName :this.lastName , email : this.email,phone :this.phone,password : this.password,companyName:this.companyName,username :this.userName })
            .then((result) => {
                console.log('inside of register form');
                this.openLoginForm=true;
                this.openRegister=false;


                                        
            if(result){            
                console.log('result', result);

                window.location.href = result;
                console.log('aaaaaaaaaaaaaa',   window.location.href);

            } 
            
            this.showTermsAndConditionsLoading = false;
        })
        .catch((error) => {
            this.error = error;

            console.log('error-',error);
        })
                 
    }
});

   
    }

}