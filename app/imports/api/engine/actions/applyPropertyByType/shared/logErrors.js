export default function logErrors(errors, actionContext){
  errors?.forEach(error => {
    if (error.type !== 'info'){
      actionContext.addLog({name: 'Error', value: error.message});
    }
  });
}
