document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

//sumbit handler
  document.querySelector("#compose-form").addEventListener('submit',send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id){
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail-view').style.display = 'block';

    document.querySelector('#email-detail-view').innerHTML= `
    <ul class="list-group">
    <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
    <li class="list-group-item"><strong>Recipients: </strong> ${email.recipients}</li>
    <li class="list-group-item"><strong>Subject: </strong> ${email.subject}</lui>
    <li class="list-group-item"><strong>Timestamp: </strong> ${email.timestamp}</li>
    <li class="list-group-item">${email.body}</li>
  </ul>
    `    
    //Change to read
    if(!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }


    //Add to archives/unarchives 
    const btn_arch = document.createElement('button');
    btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive"; 
    btn_arch.className =  email.archived ? "btn btn-success" : "btn btn-danger"; 
    btn_arch.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
      .then(() => { load_mailbox('archive')})
    });
    document.querySelector('#email-detail-view').append(btn_arch);


    //Reply 
    const btn_reply = document.createElement('button');
    btn_reply.innerHTML = "Reply" 
    btn_reply.className =  "btn btn-info"; 
    btn_reply.addEventListener('click', function() {
      compose_email();
      
      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject; 
      if(subject.split(' ', 1)[0] !="Re"){
        subject = "Re: " + email.subject; 

      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      
    });
    document.querySelector('#email-detail-view').append(btn_reply);
  
});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get the emails for that mailboc and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // loop through email and div for each 
    emails.forEach(singleEmail => {
       console.log(singleEmail);

      //create div for each email 
      const newEmail = document.createElement('div');
      newEmail.className = "list-group-item";  
      newEmail.innerHTML = `
      <h5>Send: ${singleEmail.sender}</h5> 
      <h6>Subject: ${singleEmail.subject}</h6> 
      <p>${singleEmail.timestamp}</p>
      `;

      //change background color
      newEmail.className = singleEmail.read ? `read` : `unread`; 
      
      // add click event to view mail 
      newEmail.addEventListener('click', function() {
        view_email(singleEmail.id)
      });
    document.querySelector('#emails-view').append(newEmail);
    });
}); 
}

function send_email(event){
  event.preventDefault();

  //store field 
  const recipients = document.querySelector('#compose-recipients').value;
  const subject =  document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('send'); 
  });
}


