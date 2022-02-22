export default function logErrors(errors, log){
  errors?.forEach(error => {
    if (error.type !== 'info'){
      log.content.push({name: 'Error', value: error.message});
    }
  });
}
