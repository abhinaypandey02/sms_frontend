import * as React from "react"
import axios from 'axios';
import {Badge, Button, Form, FormControl, FormGroup, FormLabel} from 'react-bootstrap';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Helmet} from "react-helmet";
import favicon from '../images/icon.png'
import {signIn} from "../firebase";
const IndexPage = () => {
    const [from, setFrom] = React.useState("");
    const [contacts, setContacts] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [phones, setPhones] = React.useState([]);
    const [loading,setLoading]=React.useState(false);
    const [loggedIn,setLoggedIn]=React.useState(false);
    const [password,setPassword]=React.useState("");
    function reset(){
        setLoading(false)
        setMessage('')
        setContacts('')
        setPhones([])
        setFrom('')
    }
    function getCleanArray(str) {
        if(!str)return []
        const rawSplit = str.split(/[\n,\s]+/);
        const cleanStrings = rawSplit.map(contact => contact.split('').filter(char => char >= '0' && char <= '9').join(''));
        const final = cleanStrings.filter(phone => phone.length === 11);
        return [...new Set(final)]
    }

    function onSubmit(e) {
        e.preventDefault();
        if(!contacts){
            alert("Contacts box empty!");
            return;
        }
        if(!message){
            alert("Message box empty!");
            return;
        }
        const cleanFrom=from.split('').filter(char => char >= '0' && char <= '9').join('');
        if(cleanFrom.length!==11){
            alert("Invalid From");
            return;
        }
        setFrom(cleanFrom)
        const parsedPhones=getCleanArray(contacts);
        if(parsedPhones.length===0){
            alert("No Valid Phone Number!");
            return;
        }
        setPhones(parsedPhones);
    }

    function onFileChange(e) {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.type !== "text/plain") {
            e.target.value = null;
            alert("Kindly provide a .txt file");
            return;
        }
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            if (reader.result) {
                const txt = reader.result.toString();
                const arr = getCleanArray(txt);
                const contactsArr = getCleanArray(contacts);
                let s = ""
                contactsArr.forEach(c => s += `${c}, `);
                arr.forEach(c => s += `${c}, `);
                if (s.length > 2) {
                    s = s.slice(0, s.length - 2);
                }
                setContacts(s);


            }
            e.target.value = null;
        };

        reader.onerror = function () {
            console.log(reader.error);
            e.target.value = null;
        };
    }

    function send() {
        setLoading(true);
        axios.post('https://us-central1-nexmo-50c56.cloudfunctions.net/sendMessage',{
            to:phones,
            from,
            text:message
        }).then(res=>{
            if(res.data.failed){
                if(res.data.failed.length>0){
                    alert("SMS failed for "+res.data.failed.join(', '));
                    return;
                }
            }
            alert("Messages sent successfully!")
        }).catch(err=>{
            console.error(err);
            alert("An error occurred!")
        }).finally(reset)
    }
    async function onLoginFormSubmit(e){
        e.preventDefault();
        setLoggedIn(await signIn(password));
    }

    return (
        <main>
            <Helmet>
                <meta charSet="utf-8" />
                <title>SMS Sender</title>
                <link rel="icon" type="image/png" href={favicon} sizes="16x16" />
            </Helmet>
            {!loggedIn&&<div>
                <h2>LOGIN</h2>
                <Form onSubmit={onLoginFormSubmit}>
                <FormGroup className={'form-group'}>
                    <FormLabel>Password</FormLabel>
                    <FormControl required={true} className={'form-control'} placeholder="Enter Password" type="password" name="password"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}/>
                </FormGroup>
                <FormGroup className={'form-group'}>
                    <Button variant={'info'} type={'submit'}>Send</Button>
                </FormGroup>
            </Form></div>}
            {loggedIn&&phones.length === 0 && <div>
                <h1 className="form-heading">SMS Sender</h1>
                <Form onSubmit={onSubmit}>
                    <FormGroup className={'form-group'}>
                        <FormLabel>From</FormLabel>
                        <FormControl className={'form-control'} placeholder="Enter From"
                                     value={from}
                                     onChange={(e) => setFrom(e.target.value)}/>
                    </FormGroup>
                    <FormGroup className={'form-group'}>
                        <FormLabel>Contacts list (seperated by comma)</FormLabel>
                        <FormControl className={'form-control'} placeholder="Enter Contacts (seperated by a comma)"
                               value={contacts}
                               onChange={(e) => setContacts(e.target.value)}/>
                    </FormGroup>
                    <FormGroup className={'form-group'}>
                        <FormLabel >Add a txt file</FormLabel>
                        <FormControl type={'file'} placeholder="Choose text file"
                               onChange={onFileChange}/>
                    </FormGroup>
                    <FormGroup className={'form-group'}>
                        <FormLabel >Message to send</FormLabel>

                        <FormControl as={'textarea'} placeholder="Enter your message" value={message}
                                  onChange={(e) => setMessage(e.target.value)}/>
                    </FormGroup>
                    <FormGroup className={'form-group'}>
                        <Button variant={'success'} type={'submit'}>Send</Button>
                        <Button variant={'danger'} className={'m-2 my-3'} onClick={reset}>Reset</Button>

                    </FormGroup>
                </Form>
            </div>}
            {loggedIn&&phones.length > 0 && <div className={'confirm'}>
                <h3 className={'confirm-heading m-2'}>Confirm the following phone numbers and message:</h3>
                <div className={'phones'}>{phones.map(p => <Badge pill={true} bg={'warning'} className={'m-2 phone'} key={p}>+{p}</Badge>)}</div>
                <div className={'message m-2'}><b>Message: </b><i>{message}</i></div>
                <div className={'message m-2'}><b>From: </b><i>+{from}</i></div>
                <Button disabled={loading} variant={'success'} className={'m-2 my-3'} onClick={send}>Send</Button>
                <Button disabled={loading} variant={'danger'} className={'m-2 my-3'} onClick={()=>setPhones([])}>Back</Button>
            </div>}
        </main>
    )
}

export default IndexPage
