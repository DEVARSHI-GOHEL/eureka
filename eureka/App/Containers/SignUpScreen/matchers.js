export const email_reg =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const password_reg = /((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,})/;
export const multiNationalName = /^[^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{1,}$/;
export const deviceMsn_reg = /^[a-zA-Z0-9]*$/;