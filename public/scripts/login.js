
const name = document.getElementById('username')
const password = document.getElementById('password')
const form = document.getElementById('form')
const errorElement = document.getElementById('error')
const postBtn = document.getElementById('test')

form.addEventListener('submit', (e) => {
  let messages = []
  if (name.value === '' || name.value == null) {
    messages.push('Name is required')
  }
  if (password.value.length <= 6) {
    messages.push('Password must be longer than 6 characters')
  }

  if (password.value.length >= 20) {
    messages.push('Password must be less than 20 characters')
  }

  if (password.value === 'password') {
    messages.push('Password cannot be password')
  }

  if (messages.length > 0) {
    e.preventDefault()
    errorElement.innerText = messages.join(', ')
  }
})



const sendHttpRequest = (method, url, data) => {
  //promise is used when using asynchronous actions.  
  //the asynchronous method returns a promise to supply the value at some point in the future
  //resolved = meaning the operation is completed successfully
  //reject = meaning the operation failed
  const promise = new Promise((resolve, reject) => {
    //make a request object
    const xhr = new XMLHttpRequest();

    //we insert the method and the url
    xhr.open(method, url);

    //we make sure the responce is parsed to json
    xhr.responseType = 'json';

    //if there is data
    if (data) {
      //signals that we are appending json data
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.onload = () => {
      //if there is an error
      if (xhr.status >= 400) {
        reject(xhr.response);
      } else {
        //if there is no error
        resolve(xhr.response);
      }
    };

    //when we get an error from the request
    xhr.onerror = () => {
      //we reject our promise
      reject('Something went wrong!');
    };

    xhr.send(JSON.stringify(data));
  });
  return promise;
};

const sendData = () => {
  //make a POST request to following url
  sendHttpRequest('POST', 'https://reqres.in/api/login', {
    "email": "eve.holt@reqres.in",
    "password": "cityslicka"
  })//what we do with the data
    .then(responseData => {
     console.log(responseData);  
    })//when there is an error
    .catch(err => {
      console.log(err);
    });
};

postBtn.addEventListener('click', sendData);