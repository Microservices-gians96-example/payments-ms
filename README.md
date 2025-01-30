
# Payments Microservice

## Installation

```bash
$ npm install
```

## Adquirir el token de acceso de Stripe en el siguiente enlace:

https://dashboard.stripe.com/test/apikeys

## Para probar el servicio de pagos necesitamos usar el CLI de Stripe

https://docs.stripe.com/stripe-cli?install-method=windows


## Vamos a crear un webhook para el servicio de pagos

https://dashboard.stripe.com/test/webhooks

## Para usar la version real cuando la aplicacion este en produccion, podemos usar el siguiente enlace:

https://dashboard.hookdeck.com/

## Para habilitar el CLI para los webhooks
```
hookdeck listen 3003 stripe-to-localhost 
```