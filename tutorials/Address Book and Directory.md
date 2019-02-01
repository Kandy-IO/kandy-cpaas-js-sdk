---
layout: page
categories: quickstarts-javascript
title: Address Book and Directory
permalink: /quickstarts/javascript/cpaas2/Address%20Book%20and%20Directory
position: 6
---

# Address Book and Directory

This document demonstrates the Address Book and Directory APIs using the JavaScript SDK.

## Address Book

In this first section, we will look at the Address Book API.

### Configuration

There is no specific configuration or setup required to make use of the Address Book API.

```hidden javascript
// Instantiate the SDK
const client = Kandy.create({
  subscription: {
    expires: 3600
  },
  // Required: Server connection configs.
  authentication: {
    server: {
      base: '$KANDYFQDN$'
    },
    clientCorrelator: 'sampleCorrelator'
  }
})
```

### Authentication

To use the Address Book API you will first need to set your credentials by authenticating. Make sure to have your _ClientID_, _Email_, and _Password_ ready to login so you can start using the API. When testing with the Codepen, you will need to enter those values into the fields at the top of the page and then click **login**.

### Using the API

All of the Address Book API methods are available on the `contacts` namespace. They can be accessed as demonstrated in this example:

```javascript exclude
client.contacts.refresh()
```

Now let's look at the API in more detail!

#### Adding a contact

With the credentials set, we can begin making use of the Address Book API. To add contacts to the Address Book, create a contact object and pass it to the `add` function:

```javascript exclude
const contact = {
  contactId: 'JaneD', // Unique ID for your Address Book
  primaryContact: 'janedoe@yourdomain.com', // Contact's ID in the Directory
  firstName: 'Jane',
  lastName: 'Doe',
  homePhoneNumber: '+1-555-555-5555', // Home phone number in E164 format
  businessPhoneNumber: '+1-555-555-5556', // Business phone number in E164 format
  emailAddress: 'janedoe@yourdomain.com',
  buddy: true // Buddy status of this contact
}

client.contacts.add(contact)
```

#### Updating a contact

To update any of a contact's details, make use of the `update` function. This function takes two parameters, the `contactId` and an object with the updated information :

```javascript exclude
const contact = {
  primaryContact: 'janedoe@yourdomain.com', // How the contact is identified in the Directory Service
  firstName: 'Jane', // First name
  lastName: 'Doe', // Last name
  homePhoneNumber: '+1-555-555-5555', // Home phone number in E164 format
  businessPhoneNumber: '+1-555-555-5556', // Business phone number in E164 format
  emailAddress: 'janedoe@yourdomain.com', // Email address
  buddy: false // Buddy status has changed
}

client.contacts.update('JaneD', contact)
```

#### Removing a contact

To remove a contact from the Address Book, simply pass the contact's `contactId` value to the `remove` function:

```javascript exclude
client.contacts.remove('JaneD')
```

#### Refreshing contacts

You can fetch all of the user's Address Book contacts by calling the `refresh` function:

```javascript exclude
client.contacts.refresh()
```

Be sure to subscribe to the `contacts:change` so you are notified the moment these contact objects are available for you to get from the SDK. You can find out more in the [events section](#Events)

#### Fetching one contact

If you simply want to fetch one contact from your Address Book, use the `fetch` function:

```javascript exclude
let contactId = 'MyBestFriend'

client.contacts.fetch(contactId)
```

Again, you will know when you can access this contact object by subscribing to the [contacts:change event](#Events)

#### Retrieving contacts

You can get the contacts from the SDK at anytime by using the `get` and `getAll` functions. `get` takes the contact's **contactId** as a parameter and returns one contact object, whereas `getAll` will return an array of contact objects:

```javascript exclude
const janeDoe = client.contacts.get('JaneD')

const contacts = client.contacts.getAll()
```

### Events

#### Address Book changes

The `contacts:change` event will be triggered anytime a change to the Address Book occurs. You can subscribe to this event as follows:

```javascript exclude
client.on('contacts:change', function () {
  // Retrieve the updated Array of contacts using the `getAll` function
  const contacts = client.contacts.getAll()
}
```

When a new contact is added to the address book, the `contacts:new` event will fire. Notice that this event receives the new contact as a parameter:

```javascript exclude
client.on('contacts:new', function(contact) {
  processContact(contact)
})
```

If a call to one of the API methods results in an error, you can retrieve it by subscribing to the `contacts:error` event:

```javascript exclude
client.on('contacts:error', function (error) {
  handleError(error)
}
```

## Directory

This section demonstrates the use of the Directory service with the JavaScript SDK. The Directory service allows the user to discover all other users associated with their $KANDY$ account.

### Authentication

As with the Address Book API, you'll need to authenticate before you are ready to use the API.

### Using the API

All of the functionality provided by the Directory API can be accessed through the `user` namespace. For example:

```javascript exclude
client.user.fetch(primaryContact)
```

When making calls to the Directory API methods, you can make sure to know when the data has been retrieved by subscribing to the `directory:change`. Information on how to do that can be found [here](#Directory-Events):

#### Directory Search

The Directory service is mostly used to search for other users. These searches can be performed through the `search` API. This function must be given a filter object as one of its parameters, allowing you to filter on the following keys - `name`, `firstName`, `lastName`, `phoneNumber`, and `userName`:

```javascript exclude
// Filtering by name will yield results that match by either first name or last name
const filter = {
  name: 'Jane'
}

client.user.search(filter)
```

If you need additional options, you can provide another object to limit or sort the results. This object can be keyed by `sortBy`, `order` or `max`. Please observe the following as an example:

```javascript exclude
// The following query will search by last name and return a maximum of 10 results sorted in ascending order alphabetically by first name
const filters = {
  lastName: 'Doe'
}
const options = {
  sortBy: 'firstName',
  order: 'asc',
  max: 10
}

client.user.search(filters, options)
```

After a search completes, the results are sent to functions that are subscribed to the `directory:change` event. For more information, you can jump ahead to [the events section](#Directory-Events)

#### Fetching

If you simply need to fetch information about a single user, you'll need to know the value of their **userId** property as it exists in the Directory.

```javascript exclude
client.user.fetch('janeDoe@yourdomain.com')
```

Also, you can easily fetch your own user information from the directory at anytime through the `fetchSelfInfo` function.

```javascript exclude
client.user.fetchSelfInfo()
```

Finally, the users retrieved from calls to the Directory API can be accessed from the state through the `get` and `getAll` methods:

```javascript exclude
const jane = client.user.get('janeDoe@yourdomain.com')
const users = client.user.getAll()
```

### Directory Events

[Click to go back to the start](#directory)

Any retrieved data resulting from the Directory API methods will be made available in the `directory:change` event, which can be subscribed to as follows:

```javascript exclude
client.on('directory:change', function (data) {
  data.results.forEach(user => {
    processUser(user)
  })
}
```

Similarly to the Address Book API, if a call to any of the Directory API methods resulted in an error, you should retrieve it by listening to the `directory:error` event:

```javascript exclude
client.on('directory:error', function (error) {
  handleError(error)
}
```

```hidden html
<div id="main">
  <div>
    <fieldset>
        <legend>Authenticate using your account information</legend>
        Client ID: <input type='text' id='clientId'/>
        Email: <input type='text' id='email'/>
        Password: <input type='password' id='password'/>
        <input type='button' value='Login' onclick='login();' />
    </fieldset>

</div>
<div class="row" id="form-mode">
  <input type="radio" name="mode" value="directory" checked/> Directory
  <input type="radio" name="mode" value="addressBook" /> Address Book
</div>
  <div id="directory" class="container">
    <div class="row left-inner">
      <div class='column' id='left'>
        <div class='column'>
          <legend>Directory API</legend>
          <div class='row'>
            <div class='form column'>
              Name <input type="text" id="name" placeholder='Name' />
              User ID <sub><i>ex: janedoe@somedomain.com ([userId]@[domain])</i></sub>
              <input type="text" id="user-id" placeholder='User ID' />
              First <input type="text" id="first" placeholder='First Name' />
              Last <input type="text" id="last" placeholder='Last Name' />
              photoUrl <input type="text" id="photo-url" placeholder='Photo URL' />
              Phone (E164 Format) <sub><i>ex: +1-555-555-5555 (+[countryCode][areaCode][subscriberSumber] max 15 digits)</i></sub>
              <input type="text" id="phone" placeholder='Phone' />

            </div>
            <br/>
            <br/>
            <div class='column buttons'>
              <input type='button' onclick='fetchSelf()' value='Fetch Self' />
              <input type='button' onclick='fetchUser()' value='Fetch User' />
              <input type='button' onclick='searchDirectory()' value='Search Directory' />
              <input type='button' onclick='clearContactForm()' value='Clear' />
            </div>
          </div>
        </div>
        <div class='search-options row'>
            Directory Search
            <input type="text" id="filter-value" placeholder='Search' />
            Search Filters
            <input type='radio' name='filter-key' value='name' checked> Name (First or Last)
            <input type='radio' name='filter-key' value='firstName' > First Name
            <input type='radio' name='filter-key' value='lastName'> Last Name
            <input type='radio' name='filter-key' value='phoneNumber'> Phone Number
          </div>
      </div>
      <div class='column' id='right'>
        <div class='row'>
            Users: <select class='content users-select' id='userDropDown' onchange='renderUser()'></select>
        </div>
      </div>
    </div>
  </div>
  <div id="addressBook" class="container form-hidden">
    <div class="row left-inner">
      <div class='column' id='left'>
        <div class='column'>
          <legend>Address Book API</legend>
          <div class='row'>
            <div class='column'>
              <div class='form column'>
                  ID <input type="text" id="id" placeholder='ID' />
                  Primary Contact <input type="text" id="primary-contact" placeholder='Primary Contact' />
                  First <input type="text" id="firstName" placeholder='First Name' />
                  Last <input type="text" id="lastName" placeholder='Last Name' />
                  Home <input type="text" id="home-phone" placeholder='Home Phone' />
                  Business <input type="text" id="business-phone" placeholder='Business Phone' />
                  Email <input type="text" id="email" placeholder='Email' />
                  Buddy <input type="checkbox" id="buddy" />
              </div>
            </div>
            <div class='column buttons'>
              <input type='button' onclick='addContact()' value='Add' />
              <input type='button' onclick='removeContact()' value='Remove' />
              <input type='button' onclick='updateContact()' value='Update' />
              <input type='button' onclick='clearContactForm()' value='Clear' />
            </div>
          </div>
        </div>
      </div>
      <div class='column' id='right'>
        <input type='button' onclick='refreshContacts()' value='Refresh Contacts' />
        <div class='column' id='contact-table' />
      </div>
    </div>
  </div>
</div>

<div id='display'></div>

<div id='log-display'>
  <fieldset>
    <!-- Message output container. -->
    <legend>Messages</legend>
    <div id='messages'></div>
  </fieldset>
</div>
```

```hidden css
.column {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
  flex-direction: row;
}
#contact-table {
  max-height: 400px;
  overflow: auto;
}
.contact-cell > div,
.contact-cell > span {
  border: 1px solid black;
}
.contact-label {
  min-width: 10em;
  font-size: 0.825em;
}
.contact-label + div {
  min-width: 14.25em;
}
.contact-label:after {
  content: ': ';
}
.contact-render-entry {
  padding: 8px;
}
#left {
  margin-right: 1em;
}
#right {
  margin-left: 1em;
  align-items: center;
}
.form-hidden {
  display: none;
}
.buttons {
  margin-top: 2em;
}
.buttons input {
  margin: 1em;
}
input[type="button"] {
  max-width: 12em;
}
.property {
  font-weight: 700;
  padding-right: 1em;
  display: inline-block;
  min-width: 10em;
}
.value {
  color: blue;
}
```

``` hidden javascript
/**
 * Address Book functions
 **/

// Add a contact to the Address Book
function addContact() {
  let contact = getContactFormData()
  if (!contact || !contact.contactId) {
    log('Cannot add a contact to the Address Book without a contact ID!')
  } else {
    client.contacts.add(getContactFormData())
  }
}

// Remove a contact from the Address Book
function removeContact() {
  let contactId = getSelectedContactId()
  client.contacts.remove(contactId)
}

// Update the details of a contact in the Address Book
function updateContact() {
  const contact = getContactFormData()
  if (contact) {
    if (!contact.contactId) {
      log('Cannot update a contact with no contact ID!')
    } else {
      client.contacts.update(contact.contactId, contact)
    }
  }
}

// Retrieve all contacts from the Address Book
function refreshContacts() {
  client.contacts.refresh()
}

// Get data from the contact form
function getContactFormData() {
  const contactId = document.getElementById('id').value
  const primaryContact = document.getElementById('primary-contact').value
  const firstName = document.getElementById('firstName').value
  const lastName = document.getElementById('lastName').value
  const emailAddress = document.getElementById('email').value
  const homePhoneNumber = document.getElementById('home-phone').value
  const businessPhoneNumber = document.getElementById('business-phone').value
  const buddy = document.getElementById('buddy').checked

  return { contactId, primaryContact, firstName, lastName, emailAddress, homePhoneNumber, businessPhoneNumber, buddy }
}

// Assign callback functions to address book events
client.on('contacts:change', () => {
  updateContactsTable()
})

client.on('contacts:new', contact => {
  updateContactsTable()
})

// Helper function to update the contacts select list
function updateContactsTable() {
  const contactTable = document.getElementById('contact-table')
  contactTable.innerHTML = ''
  const contacts = client.contacts.getAll()
  for (let contactId in contacts) {
    const contactEntry = document.createElement('div')
    contactEntry.classList.add('contact-render-entry')
    contactEntry.appendChild(buildContactRow(contacts[contactId]))
    contactTable.appendChild(contactEntry)
  }
}

function buildContactRow (contact) {
  const wrap = document.createElement('div')
  wrap.className = 'contact-' + contact.contactId
  if (contact) {
    for (let prop in contact) {
      const row = document.createElement('span')
      const label = document.createElement('span')
      const cell = document.createElement('div')
      row.className = 'contact-cell row'
      label.className = 'contact-label'
      label.innerHTML = prop
      cell.className = prop
      cell.innerHTML = contact[prop]
      row.appendChild(label)
      row.appendChild(cell)
      wrap.appendChild(row)
    }
  }
  return wrap
}

/**
 * Directory functions
 **/

// Fetch one user from the directory
function fetchUser() {
  const userId = document.getElementById('user-id').value

  client.user.fetch(userId)
}

// Search the directory for users
function searchDirectory() {
  const filterValue = document.getElementById('filter-value').value
  const filterType = document.querySelector('input[name=filter-key]:checked').value

  client.user.search({ [filterType]: filterValue })
}

// Fetch your own user information
function fetchSelf() {
  client.user.fetchSelfInfo()
}

// Assign functions to receive directory events
client.on('directory:change', () => {
  updateUserList()
})

// Assign functions to receive directory-related error events
client.on('directory:error', error => {
  const logMessage = 'An error occured: ' + error
  log(logMessage)
})

// Helper function to update the contacts select list
function updateUserList() {
  const select = document.getElementById('userDropDown')
  select.innerHTML = ''
  const users = client.users.getAll()
  for (let userId in users) {
    for (let opt of select.options) {
      if (opt.value === userId) {
        select.removeChild(opt)
      }
    }
    var opt = document.createElement('option')
    opt.value = opt.text = contactId
    select.appendChild(opt)
    if (select.options.length === 1) {
      renderUser()
    }
  }
}

// Helper function to render a contact and update the user form
function renderUser(id) {
  const userId = id || getSelectedUser()

  if (userId) {
    const user = client.user.get(userId)
    updateUserForm(user)
    const userDisplay = document.getElementById('display')
    let text = '<h3>User Info</h3>'
    userDisplay.innerHTML = ''
    Object.keys(user).forEach(
      key =>
        (text = text + '<span class="property">' + key + ': </span><span class="value">' + user[key] + '</span><br />')
    )

    userDisplay.innerHTML = text
  }
}

// Get the contact ID from the selected option in the contact select list
function getSelectedUser() {
  return document.getElementById('userDropDown').value
}

// Update the user form with data from a user
function updateUserForm(user) {
  document.getElementById('user-id').value = user.userId
  document.getElementById('name').value = user.name
  document.getElementById('first').value = user.firstName
  document.getElementById('last').value = user.lastName
  document.getElementById('photoUrl').value = user.photoUrl
  document.getElementById('phone').value = user.phone
}

// Utility function for appending messages to the message div.
function log(message) {
  // Wrap message in textNode to guarantee that it is a string
  const textNode = document.createTextNode(message)
  const divContainer = document.createElement('div')
  divContainer.appendChild(textNode)
  document.getElementById('messages').appendChild(divContainer)
}

const directoryForm = document.getElementById('directory')
const addressBookForm = document.getElementById('addressBook')
// Logic allowing to switch between the Address Book GUI and the Directory GUI
Array.from(document.getElementById('form-mode').getElementsByTagName('input')).forEach(input => {
  input.addEventListener('click', e => {
    switch (e.srcElement.value) {
      case 'addressBook':
        directoryForm.classList.add('form-hidden')
        addressBookForm.classList.remove('form-hidden')
        break

      case 'directory':
        addressBookForm.classList.add('form-hidden')
        directoryForm.classList.remove('form-hidden')
        break
    }
  })
})
```

```hidden javascript

const cpaasAuthUrl = 'https://$KANDYFQDN$/cpaas/auth/v1/token'

/**
 * Creates a form body from a dictionary
 */
function createFormBody(paramsObject) {
  const keyValuePairs = Object.entries(paramsObject).map(
    ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
  )
  return keyValuePairs.join('&')
}

/**
 * Gets the tokens necessary for authentication to $KANDY$
 */
async function getTokens({ clientId, username, password }) {
  const formBody = createFormBody({
    client_id: clientId,
    username,
    password,
    grant_type: 'password',
    scope: 'openid'
  })

  // POST a request to create a new authentication access token.
  const fetchResult = await fetch(cpaasAuthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  })

  // Parse the result of the fetch as a JSON format.
  const data = await fetchResult.json()

  return { accessToken: data.access_token, idToken: data.id_token }
}

async function login() {
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    const tokens = await getTokens({ clientId, username: userEmail, password })
    client.setTokens(tokens)

    log('Successfully logged in as ' + userEmail)
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

## Live Demo

Test out the Address Book and Directory APIs with this example using Codepen.

```codepen
{
    "title": "The JavaScript SDK Address Book and Directory Demo",
    "editors": 101,
    "js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```
