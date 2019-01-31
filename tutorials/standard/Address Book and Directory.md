---
layout: page
categories: quickstarts-javascript
title: Address Book and Directory
permalink: /quickstarts/javascript/cpaas2/Address%20Book%20and%20Directory
position: 6
---

# Address Book & Directory

This document demonstrates the Address Book and Directory APIs using the JavaScript SDK.

## Address Book

In this first section, we will look at the Address Book API.

### Configuration

There is no specific configuration or setup required to make use of the Address Book API.

### Authentication

To use the Address Book API you will first need to set your credentials by authenticating. Make sure to have your _ClientID_, _Email_, and _Password_ ready to login so you can start using the API. When testing with the Codepen, you will need to enter those values into the fields at the top of the page and then click **login**.

### Using the API

All of the Address Book API methods are available on the `contacts` namespace. They can be accessed as demonstrated in this example:

```javascript 
client.contacts.refresh()
```

Now let's look at the API in more detail!

#### Adding a contact

With the credentials set, we can begin making use of the Address Book API. To add contacts to the Address Book, create a contact object and pass it to the `add` function:

```javascript 
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

```javascript 
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

```javascript 
client.contacts.remove('JaneD')
```

#### Refreshing contacts

You can fetch all of the user's Address Book contacts by calling the `refresh` function:

```javascript 
client.contacts.refresh()
```

Be sure to subscribe to the `contacts:change` so you are notified the moment these contact objects are available for you to get from the SDK. You can find out more in the [events section](#Events)

#### Fetching one contact

If you simply want to fetch one contact from your Address Book, use the `fetch` function:

```javascript 
let contactId = 'MyBestFriend'

client.contacts.fetch(contactId)
```

Again, you will know when you can access this contact object by subscribing to the [contacts:change event](#Events)

#### Retrieving contacts

You can get the contacts from the SDK at anytime by using the `get` and `getAll` functions. `get` takes the contact's **contactId** as a parameter and returns one contact object, whereas `getAll` will return an array of contact objects:

```javascript 
const janeDoe = client.contacts.get('JaneD')

const contacts = client.contacts.getAll()
```

### Events

#### Address Book changes

The `contacts:change` event will be triggered anytime a change to the Address Book occurs. You can subscribe to this event as follows:

```javascript 
client.on('contacts:change', function () {
  // Retrieve the updated Array of contacts using the `getAll` function
  const contacts = client.contacts.getAll()
}
```

When a new contact is added to the address book, the `contacts:new` event will fire. Notice that this event receives the new contact as a parameter:

```javascript 
client.on('contacts:new', function(contact) {
  processContact(contact)
})
```

If a call to one of the API methods results in an error, you can retrieve it by subscribing to the `contacts:error` event:

```javascript 
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

```javascript 
client.user.fetch(primaryContact)
```

When making calls to the Directory API methods, you can make sure to know when the data has been retrieved by subscribing to the `directory:change`. Information on how to do that can be found [here](#Directory-Events):

#### Directory Search

The Directory service is mostly used to search for other users. These searches can be performed through the `search` API. This function must be given a filter object as one of its parameters, allowing you to filter on the following keys - `name`, `firstName`, `lastName`, `phoneNumber`, and `userName`:

```javascript 
// Filtering by name will yield results that match by either first name or last name
const filter = {
  name: 'Jane'
}

client.user.search(filter)
```

If you need additional options, you can provide another object to limit or sort the results. This object can be keyed by `sortBy`, `order` or `max`. Please observe the following as an example:

```javascript 
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

```javascript 
client.user.fetch('janeDoe@yourdomain.com')
```

Also, you can easily fetch your own user information from the directory at anytime through the `fetchSelfInfo` function.

```javascript 
client.user.fetchSelfInfo()
```

Finally, the users retrieved from calls to the Directory API can be accessed from the state through the `get` and `getAll` methods:

```javascript 
const jane = client.user.get('janeDoe@yourdomain.com')
const users = client.user.getAll()
```

### Directory Events

[Click to go back to the start](#directory)

Any retrieved data resulting from the Directory API methods will be made available in the `directory:change` event, which can be subscribed to as follows:

```javascript 
client.on('directory:change', function (data) {
  data.results.forEach(user => {
    processUser(user)
  })
}
```

Similarly to the Address Book API, if a call to any of the Directory API methods resulted in an error, you should retrieve it by listening to the `directory:error` event:

```javascript 
client.on('directory:error', function (error) {
  handleError(error)
}
```

## Live Demo

Test out the Address Book and Directory APIs with this example using Codepen.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * The JavaScript SDK Address Book and Directory Demo\n */\n\n// Instantiate the SDK\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Address Book functions\n **/\n\n// Add a contact to the Address Book\nfunction addContact() {\n  let contact = getContactFormData()\n  if (!contact || !contact.contactId) {\n    log(&apos;Cannot add a contact to the Address Book without a contact ID!&apos;)\n  } else {\n    client.contacts.add(getContactFormData())\n  }\n}\n\n// Remove a contact from the Address Book\nfunction removeContact() {\n  let contactId = getSelectedContactId()\n  client.contacts.remove(contactId)\n}\n\n// Update the details of a contact in the Address Book\nfunction updateContact() {\n  const contact = getContactFormData()\n  if (contact) {\n    if (!contact.contactId) {\n      log(&apos;Cannot update a contact with no contact ID!&apos;)\n    } else {\n      client.contacts.update(contact.contactId, contact)\n    }\n  }\n}\n\n// Retrieve all contacts from the Address Book\nfunction refreshContacts() {\n  client.contacts.refresh()\n}\n\n// Get data from the contact form\nfunction getContactFormData() {\n  const contactId = document.getElementById(&apos;id&apos;).value\n  const primaryContact = document.getElementById(&apos;primary-contact&apos;).value\n  const firstName = document.getElementById(&apos;firstName&apos;).value\n  const lastName = document.getElementById(&apos;lastName&apos;).value\n  const emailAddress = document.getElementById(&apos;email&apos;).value\n  const homePhoneNumber = document.getElementById(&apos;home-phone&apos;).value\n  const businessPhoneNumber = document.getElementById(&apos;business-phone&apos;).value\n  const buddy = document.getElementById(&apos;buddy&apos;).checked\n\n  return { contactId, primaryContact, firstName, lastName, emailAddress, homePhoneNumber, businessPhoneNumber, buddy }\n}\n\n// Assign callback functions to address book events\nclient.on(&apos;contacts:change&apos;, () => {\n  updateContactsTable()\n})\n\nclient.on(&apos;contacts:new&apos;, contact => {\n  updateContactsTable()\n})\n\n// Helper function to update the contacts select list\nfunction updateContactsTable() {\n  const contactTable = document.getElementById(&apos;contact-table&apos;)\n  contactTable.innerHTML = &apos;&apos;\n  const contacts = client.contacts.getAll()\n  for (let contactId in contacts) {\n    const contactEntry = document.createElement(&apos;div&apos;)\n    contactEntry.classList.add(&apos;contact-render-entry&apos;)\n    contactEntry.appendChild(buildContactRow(contacts[contactId]))\n    contactTable.appendChild(contactEntry)\n  }\n}\n\nfunction buildContactRow (contact) {\n  const wrap = document.createElement(&apos;div&apos;)\n  wrap.className = &apos;contact-&apos; + contact.contactId\n  if (contact) {\n    for (let prop in contact) {\n      const row = document.createElement(&apos;span&apos;)\n      const label = document.createElement(&apos;span&apos;)\n      const cell = document.createElement(&apos;div&apos;)\n      row.className = &apos;contact-cell row&apos;\n      label.className = &apos;contact-label&apos;\n      label.innerHTML = prop\n      cell.className = prop\n      cell.innerHTML = contact[prop]\n      row.appendChild(label)\n      row.appendChild(cell)\n      wrap.appendChild(row)\n    }\n  }\n  return wrap\n}\n\n/**\n * Directory functions\n **/\n\n// Fetch one user from the directory\nfunction fetchUser() {\n  const userId = document.getElementById(&apos;user-id&apos;).value\n\n  client.user.fetch(userId)\n}\n\n// Search the directory for users\nfunction searchDirectory() {\n  const filterValue = document.getElementById(&apos;filter-value&apos;).value\n  const filterType = document.querySelector(&apos;input[name=filter-key]:checked&apos;).value\n\n  client.user.search({ [filterType]: filterValue })\n}\n\n// Fetch your own user information\nfunction fetchSelf() {\n  client.user.fetchSelfInfo()\n}\n\n// Assign functions to receive directory events\nclient.on(&apos;directory:change&apos;, () => {\n  updateUserList()\n})\n\n// Assign functions to receive directory-related error events\nclient.on(&apos;directory:error&apos;, error => {\n  const logMessage = &apos;An error occured: &apos; + error\n  log(logMessage)\n})\n\n// Helper function to update the contacts select list\nfunction updateUserList() {\n  const select = document.getElementById(&apos;userDropDown&apos;)\n  select.innerHTML = &apos;&apos;\n  const users = client.users.getAll()\n  for (let userId in users) {\n    for (let opt of select.options) {\n      if (opt.value === userId) {\n        select.removeChild(opt)\n      }\n    }\n    var opt = document.createElement(&apos;option&apos;)\n    opt.value = opt.text = contactId\n    select.appendChild(opt)\n    if (select.options.length === 1) {\n      renderUser()\n    }\n  }\n}\n\n// Helper function to render a contact and update the user form\nfunction renderUser(id) {\n  const userId = id || getSelectedUser()\n\n  if (userId) {\n    const user = client.user.get(userId)\n    updateUserForm(user)\n    const userDisplay = document.getElementById(&apos;display&apos;)\n    let text = &apos;<h3>User Info</h3>&apos;\n    userDisplay.innerHTML = &apos;&apos;\n    Object.keys(user).forEach(\n      key =>\n        (text = text + &apos;<span class=\&quot;property\&quot;>&apos; + key + &apos;: </span><span class=\&quot;value\&quot;>&apos; + user[key] + &apos;</span><br />&apos;)\n    )\n\n    userDisplay.innerHTML = text\n  }\n}\n\n// Get the contact ID from the selected option in the contact select list\nfunction getSelectedUser() {\n  return document.getElementById(&apos;userDropDown&apos;).value\n}\n\n// Update the user form with data from a user\nfunction updateUserForm(user) {\n  document.getElementById(&apos;user-id&apos;).value = user.userId\n  document.getElementById(&apos;name&apos;).value = user.name\n  document.getElementById(&apos;first&apos;).value = user.firstName\n  document.getElementById(&apos;last&apos;).value = user.lastName\n  document.getElementById(&apos;photoUrl&apos;).value = user.photoUrl\n  document.getElementById(&apos;phone&apos;).value = user.phone\n}\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\nconst directoryForm = document.getElementById(&apos;directory&apos;)\nconst addressBookForm = document.getElementById(&apos;addressBook&apos;)\n// Logic allowing to switch between the Address Book GUI and the Directory GUI\nArray.from(document.getElementById(&apos;form-mode&apos;).getElementsByTagName(&apos;input&apos;)).forEach(input => {\n  input.addEventListener(&apos;click&apos;, e => {\n    switch (e.srcElement.value) {\n      case &apos;addressBook&apos;:\n        directoryForm.classList.add(&apos;form-hidden&apos;)\n        addressBookForm.classList.remove(&apos;form-hidden&apos;)\n        break\n\n      case &apos;directory&apos;:\n        addressBookForm.classList.add(&apos;form-hidden&apos;)\n        directoryForm.classList.remove(&apos;form-hidden&apos;)\n        break\n    }\n  })\n})\n\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from a dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\n\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;email&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n&quot;,&quot;html&quot;:&quot;<div id=\&quot;main\&quot;>\n  <div>\n    <fieldset>\n        <legend>Authenticate using your account information</legend>\n        Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n        Email: <input type=&apos;text&apos; id=&apos;email&apos;/>\n        Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n        <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n    </fieldset>\n\n</div>\n<div class=\&quot;row\&quot; id=\&quot;form-mode\&quot;>\n  <input type=\&quot;radio\&quot; name=\&quot;mode\&quot; value=\&quot;directory\&quot; checked/> Directory\n  <input type=\&quot;radio\&quot; name=\&quot;mode\&quot; value=\&quot;addressBook\&quot; /> Address Book\n</div>\n  <div id=\&quot;directory\&quot; class=\&quot;container\&quot;>\n    <div class=\&quot;row left-inner\&quot;>\n      <div class=&apos;column&apos; id=&apos;left&apos;>\n        <div class=&apos;column&apos;>\n          <legend>Directory API</legend>\n          <div class=&apos;row&apos;>\n            <div class=&apos;form column&apos;>\n              Name <input type=\&quot;text\&quot; id=\&quot;name\&quot; placeholder=&apos;Name&apos; />\n              User ID <sub><i>ex: janedoe@somedomain.com ([userId]@[domain])</i></sub>\n              <input type=\&quot;text\&quot; id=\&quot;user-id\&quot; placeholder=&apos;User ID&apos; />\n              First <input type=\&quot;text\&quot; id=\&quot;first\&quot; placeholder=&apos;First Name&apos; />\n              Last <input type=\&quot;text\&quot; id=\&quot;last\&quot; placeholder=&apos;Last Name&apos; />\n              photoUrl <input type=\&quot;text\&quot; id=\&quot;photo-url\&quot; placeholder=&apos;Photo URL&apos; />\n              Phone (E164 Format) <sub><i>ex: +1-555-555-5555 (+[countryCode][areaCode][subscriberSumber] max 15 digits)</i></sub>\n              <input type=\&quot;text\&quot; id=\&quot;phone\&quot; placeholder=&apos;Phone&apos; />\n\n            </div>\n            <br/>\n            <br/>\n            <div class=&apos;column buttons&apos;>\n              <input type=&apos;button&apos; onclick=&apos;fetchSelf()&apos; value=&apos;Fetch Self&apos; />\n              <input type=&apos;button&apos; onclick=&apos;fetchUser()&apos; value=&apos;Fetch User&apos; />\n              <input type=&apos;button&apos; onclick=&apos;searchDirectory()&apos; value=&apos;Search Directory&apos; />\n              <input type=&apos;button&apos; onclick=&apos;clearContactForm()&apos; value=&apos;Clear&apos; />\n            </div>\n          </div>\n        </div>\n        <div class=&apos;search-options row&apos;>\n            Directory Search\n            <input type=\&quot;text\&quot; id=\&quot;filter-value\&quot; placeholder=&apos;Search&apos; />\n            Search Filters\n            <input type=&apos;radio&apos; name=&apos;filter-key&apos; value=&apos;name&apos; checked> Name (First or Last)\n            <input type=&apos;radio&apos; name=&apos;filter-key&apos; value=&apos;firstName&apos; > First Name\n            <input type=&apos;radio&apos; name=&apos;filter-key&apos; value=&apos;lastName&apos;> Last Name\n            <input type=&apos;radio&apos; name=&apos;filter-key&apos; value=&apos;phoneNumber&apos;> Phone Number\n          </div>\n      </div>\n      <div class=&apos;column&apos; id=&apos;right&apos;>\n        <div class=&apos;row&apos;>\n            Users: <select class=&apos;content users-select&apos; id=&apos;userDropDown&apos; onchange=&apos;renderUser()&apos;></select>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div id=\&quot;addressBook\&quot; class=\&quot;container form-hidden\&quot;>\n    <div class=\&quot;row left-inner\&quot;>\n      <div class=&apos;column&apos; id=&apos;left&apos;>\n        <div class=&apos;column&apos;>\n          <legend>Address Book API</legend>\n          <div class=&apos;row&apos;>\n            <div class=&apos;column&apos;>\n              <div class=&apos;form column&apos;>\n                  ID <input type=\&quot;text\&quot; id=\&quot;id\&quot; placeholder=&apos;ID&apos; />\n                  Primary Contact <input type=\&quot;text\&quot; id=\&quot;primary-contact\&quot; placeholder=&apos;Primary Contact&apos; />\n                  First <input type=\&quot;text\&quot; id=\&quot;firstName\&quot; placeholder=&apos;First Name&apos; />\n                  Last <input type=\&quot;text\&quot; id=\&quot;lastName\&quot; placeholder=&apos;Last Name&apos; />\n                  Home <input type=\&quot;text\&quot; id=\&quot;home-phone\&quot; placeholder=&apos;Home Phone&apos; />\n                  Business <input type=\&quot;text\&quot; id=\&quot;business-phone\&quot; placeholder=&apos;Business Phone&apos; />\n                  Email <input type=\&quot;text\&quot; id=\&quot;email\&quot; placeholder=&apos;Email&apos; />\n                  Buddy <input type=\&quot;checkbox\&quot; id=\&quot;buddy\&quot; />\n              </div>\n            </div>\n            <div class=&apos;column buttons&apos;>\n              <input type=&apos;button&apos; onclick=&apos;addContact()&apos; value=&apos;Add&apos; />\n              <input type=&apos;button&apos; onclick=&apos;removeContact()&apos; value=&apos;Remove&apos; />\n              <input type=&apos;button&apos; onclick=&apos;updateContact()&apos; value=&apos;Update&apos; />\n              <input type=&apos;button&apos; onclick=&apos;clearContactForm()&apos; value=&apos;Clear&apos; />\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class=&apos;column&apos; id=&apos;right&apos;>\n        <input type=&apos;button&apos; onclick=&apos;refreshContacts()&apos; value=&apos;Refresh Contacts&apos; />\n        <div class=&apos;column&apos; id=&apos;contact-table&apos; />\n      </div>\n    </div>\n  </div>\n</div>\n\n<div id=&apos;display&apos;></div>\n\n<div id=&apos;log-display&apos;>\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Messages</legend>\n    <div id=&apos;messages&apos;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;.column {\n  display: flex;\n  flex-direction: column;\n}\n.row {\n  display: flex;\n  flex-direction: row;\n}\n\n#contact-table {\n  max-height: 400px;\n  overflow: auto;\n}\n.contact-cell > div,\n.contact-cell > span {\n  border: 1px solid black;\n}\n.contact-label {\n  min-width: 10em;\n  font-size: 0.825em;\n}\n.contact-label + div {\n  min-width: 14.25em;\n}\n.contact-label:after {\n  content: &apos;: &apos;;\n}\n.contact-render-entry {\n  padding: 8px;\n}\n\n#left {\n  margin-right: 1em;\n}\n\n#right {\n  margin-left: 1em;\n  align-items: center;\n}\n.form-hidden {\n  display: none;\n}\n.buttons {\n  margin-top: 2em;\n}\n.buttons input {\n  margin: 1em;\n}\ninput[type=\&quot;button\&quot;] {\n  max-width: 12em;\n}\n.property {\n  font-weight: 700;\n  padding-right: 1em;\n  display: inline-block;\n  min-width: 10em;\n}\n.value {\n  color: blue;\n}\n\n&quot;,&quot;title&quot;:&quot;The JavaScript SDK Address Book and Directory Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://raw.githubusercontent.com/Kandy-IO/kandy-cpaas-js-sdk/53775/dist/kandy.cpaas2.js&quot;} '><input type="image" src="../../../assets/resources/TryItOn-CodePen.png"></form>