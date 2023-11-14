const SendArea = () => {
  //* PASO 1: CHEQUEAR AREA
  //* PASO 2: TRAER SCANEOS
  //* PASO 3: ENVIAR DATA
  //* EXTRA: HAY UN BTN DE REENVIAR AREA, EL SISTEMA LO DETECTA AUTOMATICO O SE ENVÍA A UN ENDPOINT DIFERENTE? TENEMOS QUE EVITAR QUE SE CLONE LA INFO
};

const SendAllAreas = () => {
  //* PASO 1: CHEQUEAR AREAS CERRADAS
  //* PASO 2: TRAER ESCANEOS POR AREA
  //* PASO 3: REALIZAR MULTIPLES ENVÍOS A API (DEBERÍAMOS MOSTRAR UN CONTADOR DE AREAS ENVIADAS, POR EJ 1/10 AREAS ENVIADAS)
  //* Y EN CASO DE ERROR GUARDAR EL NOMBRE DEL AREA QUE FALLO PARA MOSTRAR EN MENSAJE DE ERROR
  //* PASO 4: MARCAR EN NUESTRA MAESTRO DB CUALES FUERON LAS AREAS ENVIADAS (LAS QUE DIERON ERROR QUEDARÍAN SIN MARCAR)
};

/* FORMATO 
{
    "Datos": {
      "TotalLectura": ...,
      "CodEmpresa": ...,
      "CodInv": ...,
      "CodCapturador": ...,
      "Area": ...,
      "id": ...,
      "token": ...
    },
    "Lecturas": [...]
  } */
