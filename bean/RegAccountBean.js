'use strict';
let RegAccountBean = function(cuid,telephone){
	this._cuid = cuid;
	this._telephone = telephone;
	this._code = "";
	this._password = "";
	this._step = 1;

	this._error_code = 0;
	this._last_send_code_time = "";
};

RegAccountBean.prototype.step = function() {
	
	return this._step;
};

RegAccountBean.prototype.setStep = function(step){
	this._step = step;
}

RegAccountBean.prototype.setTelephone = function(telephone){
	this._telephone = telephone;
}

RegAccountBean.prototype.sendVerifyCode = function(verify_code){

}

RegAccountBean.prototype.verifyRegisterStep = function(telephone,code,password){
	
	if(telephone == null) return false;

	if(this.step() == 1){
		this.setTelephone(telephone);
		this.nextStep();
	}else if(this.step() == 2){
		if (this.code() == null){
			this.onError(1019);
		}else{
			if(code != null && this.code() == code && this.telephone() == telephone){
				this.nextStep();
			}else{
				this.onError(1018);
			}
		}
		
	}else if(this.step() == 3){
		
		if(this.code() == code && tiis.telephone() == telephone){
			this.setPassword(password);
			this.nextStep();
			return true;
		}else{
			this.onError(1018);
		}
	}

	return false;
}

RegAccountBean.prototype.setPassword = function(password){
	this._password = password;
}

RegAccountBean.prototype.nextStep = function(){
	this._step += 1;
}

RegAccountBean.prototype.code = function(){
	return this._code;
}
RegAccountBean.prototype.telephone = function(){
	return this._telephone;
}

RegAccountBean.prototype.password = function(){
	return this._password;
}

RegAccountBean.prototype.onError = function(error_code){
	this._error_code = error_code;
}

RegAccountBean.prototype.result = function(){
	if(this._error_code == 0){
		if(this.step() == 1){
			return {
				'step' : 1
			};
		}else if(this.step() == 2){
			return {
				'telephone' : this.telephone(),
				'step' : 2,
			}
		}else if(this.step() == 3){
			return {
				'telephone' : this.telephone(),
				'code': this.code(),
				'step' : 3
			}
		}
	}else{
		return {
			'error':this._error_code,
		}
	}
	
}

RegAccountBean.prototype.getVerifyCode = function(){
	return this._code;
}
RegAccountBean.prototype.setVerifyCode = function(code){
	this._code = code;
}


module.exports = RegAccountBean;