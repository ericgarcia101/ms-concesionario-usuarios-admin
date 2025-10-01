import {injectable, /* inject, */ BindingScope} from '@loopback/core';
var generatePassword = require('password-generator')
var CryptoJS = require("crypto-js");


@injectable({scope: BindingScope.TRANSIENT})
export class AdministradorDeClavesService {
  constructor(/* Add @inject to inject parameters */) {}

  generarClaveAleatoria(){
    let claveAleatoria = generatePassword(8,false);
    return claveAleatoria;
  }

  cibrarTexto(texto:string){
    let textoCifrado=CryptoJS.MD5(texto).toString();
    return textoCifrado
  }
}
