import { LightningElement,track } from 'lwc';
import RaagviTech_Logo from '@salesforce/resourceUrl/RaagviTech_Logo';
import { NavigationMixin } from 'lightning/navigation';
import doLogin from '@salesforce/apex/loginRecordApex.doLogin';

export default class LoginRecord extends NavigationMixin (LightningElement) {
    openLoginForm = true;
    isChildOpen =false;
    w3webSlider1 = RaagviTech_Logo ;
    openRegister= false;
   
    username;
    emailError;
    password;
    registerHandler(event){
    this.isChildOpen =true;
    this.openLoginForm =false;
    // this.openRegister = true;
     }
    //  hanldepasswordValueChange(event){
    //     this.progressValue = event.detail;
    //  }
     isresetPasswordOpen=false;
     forgotPasswordHandler(event){


        this.isresetPasswordOpen =true;
        this.openLoginForm=false;

     }
     passwordValueChange1(event){
        this.openLoginForm = event.detail;
        console.log(' this.openLoginForm'+ this.openLoginForm);
     }
     userHandler(event){
        this.username = event.target.value;
     }
     passwordHandler(event){
        this.password = event.target.value;
     }
     isloginSucess= false;
     loginHandler(event){
        doLogin({username :this.username, password :this.password})
        .then((result) => {
                
            window.location.href = result;
            console.log('result',result);
            if(result == true){
               this.isloginSucess= true;
               this.openLoginForm = false;
            }
            else{
                console.log('else part',);
                this.emailError = 'your user name password  is incorrect';
            }
        })
        .catch((error) => {
            this.error = error;   
            console.log('error',error);   
            // this.errorCheck = true;
            this.errorMessage = error.body.message;
            console.log('error',error);   

        });

     }
    
}