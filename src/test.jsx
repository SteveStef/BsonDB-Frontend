import { useState } from 'react';
import goDropLogo from './assets/godrop.png';
import './App.css'; // Ensure this imports Tailwind CSS correctly
import Header from './Header';
import Database from './Database';
import { useEffect } from 'react';

const getToken = (name) => {
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name));
  if (!cookie) return null;
  return cookie.split('=')[1];
};

const defaultMessage = 'Please login or signup to view your database';

function Test() {
  const [auth, setAuth] = useState(false);
  const [viewLogin, setViewLogin] = useState(false);
  const [viewSignup, setViewSignup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [messageColor, setMessageColor] = useState('text-gray-600');
  const [databaseID, setDatabaseID] = useState('');
  const [viewDB, setViewDB] = useState(false);
  const [toggleVisability, setToggleVisability] = useState(true);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const validEmail = (email) => {
    if (!email) {
      setMessage('Please enter an email');
      setMessageColor('text-red-500');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email');
      setMessageColor('text-red-500');
      return false;
    }
    return true;
  }

  const login = async (e) => {
    setLoading(true);
    e.preventDefault();
    if(!validEmail(emailInput)) {
      setMessage('Please enter a valid email');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    const url = `${import.meta.env.VITE_SERVER_URL}/api/account-login`;
    const requestOptions = { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: emailInput, password: passwordInput}) 
    };
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    //console.log(data);
    if(data.error) {
      console.log(data.error);
      setMessage(data.error);
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    setMessage('Logged in');
    setMessageColor('text-blue-500');
    setLoading(false);
    let token = data.token;
    document.cookie = `token=${token}; max-age=1800; secure; path=/`;
    FetchLoggedInStatus();
  }

  const signup = async (e) => {
    setLoading(true);
    e.preventDefault();
    const url = `${import.meta.env.VITE_SERVER_URL}/api/account-signup`;
    const requestOptions = { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: email, password: emailInput}) 
    };
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    if(data.error) {
      console.log(data.error);
      setMessage(data.error);
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }

    setMessage('Account created, Here is your database connection string!');
    setMessageColor('text-blue-500');
    setLoading(false);

    let token = data.token;
    document.cookie = `token=${token}; max-age=1800; secure; path=/`;
    FetchLoggedInStatus();
  }

  const verifyAccount = async (e) => {
    try {
      e.preventDefault();
      const code = emailInput;

      setLoading(true);
      const url = `${import.meta.env.VITE_SERVER_URL}/api/account-verify`;
      const requestOptions = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, code }) 
      };
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      if(data.error) {
        console.log(data.error);
        setMessage(data.error);
        setMessageColor('text-red-500');
        setLoading(false);
        return;
      }
      setMessage('Email verified, create a password to complete signup');
      setMessageColor('text-blue-500');
      setLoading(false);
      setEmailInput('');
      setStep(3);
    } catch(error) {
      console.error(error);
      return;
    }
  }

  const sendVerificationCode = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      setMessage('Sending verification code...');
      let emailIn = emailInput;
      setEmail(emailIn);
      if(!validEmail(emailIn)) {
        setMessage('Please enter a valid email');
        setMessageColor('text-red-500');
        setLoading(false);
        return;
      }
      setEmailInput('');
      const url = `${import.meta.env.VITE_SERVER_URL}/api/account-sendVerificationCode`;
      const requestOptions = {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: emailIn}) 
      };
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      //console.log(data);
      if(data.error) {
        console.log(data.error);
        setMessage(data.error);
        setMessageColor('text-red-500');
        setLoading(false);
        return;
      }
      setMessage('Verification code sent to ' + emailIn);
      setMessageColor('text-blue-500');
      setLoading(false);
      setStep(2);
    } catch(error) {
      console.error(error);
      return;
    }
  };

  const FetchLoggedInStatus = async () => {
    try {
      const token = getToken('token');
      if(!token) {
        setMessage('Please login or signup to view your database');
        return;
      }
      const url = `${import.meta.env.VITE_SERVER_URL}/api/account-FetchLoggedInStatus`;
      const requestOptions = { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `${token}` } };
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      //console.log(data);
      if(data.error) {
        console.log(data.error);
        setAuth(false);
        setMessage('Session expired, please login again');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setMessageColor('text-red-500');
        return;
      }
      setAuth(true);
      setEmail(data.email);
      setDatabaseID(data.id);
      setMessage('Welcome, Here is your database connection string!');
    } catch(error) {
      console.error(error);
      return;
    }
  };

  useEffect(() => {
    FetchLoggedInStatus();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(databaseID).then(() => {
      setMessage('The connection string is copied to clipboard!');
      setMessageColor('text-blue-500');
    }, (err) => {
      console.error(err);
      setMessage('There was an error copying the connection string to clipboard');
      setMessageColor('text-red-500');
    });
  };

  if (auth && viewDB) {
    return <Database setViewDB={setViewDB} email={email} databaseID={databaseID} />;
  }

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12">

      <Header setViewDB={setViewDB} user={email}/>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to BsonDB</h1>
          <p style={{textAlign: "center"}} className={`mb-4 ${messageColor}`}>{message}</p>
          <div className="flex items-center justify-center space-x-4">

            {
              !auth && !viewLogin && !viewSignup? (
                <div>
                  <button onClick={() => setViewLogin(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded mx-">
                    View Existing Database
                  </button>
                  <button onClick={() => {
                    setViewSignup(true)
                    setMessage("Create an account to create a new database")
                    setMessageColor('text-gray-600')
                  }} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded mx-2">
                    Create New Database
                  </button>
                </div>
              ) : !auth && viewLogin ? (
                  <form className="flex items-center space-x-4" 
                    disabled={loading}
                    onSubmit={(e) => login(e)}>
                    <input type="email" 
                      onChange={(e) => setEmailInput(e.target.value)}
                      style={{fontSize: "14px"}}
                      autoComplete="username"
                      className="border-2 border-gray-400 p-2 w-full rounded-md" placeholder="email" />
                    <input type="password" 
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={{fontSize: "14px"}}
                      autoComplete="current-password"
                      className="border-2 border-gray-400 p-2 w-full rounded-md" placeholder="password" />
                    <button 
                      disabled={loading}
                      onClick={(e) => login(e)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3">
                      { loading ? <i className="fas fa-spinner fa-spin"></i> : 'Login' }
                    </button>
                  </form>
                )
                  : !auth && viewSignup ? (
                  <form className="flex items-center space-x-4" 
                    disabled={loading}
                    onSubmit={(e) => {
                        if(step === 1) sendVerificationCode(e)
                        if(step === 2) verifyAccount(e)
                        if(step === 3) signup(e)
                      }}>

                  <div className={step !== 3 ? "hidden" :""} style={{cursor: "pointer"}} 
                        onClick={() => setToggleVisability(!toggleVisability)}>
                    {!toggleVisability ? <i className="far fa-eye"></i> : <i className="far fa-eye-slash"></i>}
                  </div>
                    <input type={step === 3 && toggleVisability ? "password" : "text"}
                      onChange={(e) => setEmailInput(e.target.value)}
                        value={emailInput}
                      className="border-2 border-gray-400 p-2 w-full rounded-md" placeholder={`${step === 1 ? "Enter Email" : step === 2 ? "Enter Code" : "Create Password"}`} />
                    <button 
                      disabled={loading}
                      onClick={(e) => {
                          if(step === 1) sendVerificationCode(e)
                          else if(step === 2) verifyAccount(e)
                          else if(step === 3) signup(e)
                        }}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-3">
                      { loading ? <i className="fas fa-spinner fa-spin"></i> : step === 1 ? 'Verify' : step === 2 ? 'Submit' : 'Create' }
                    </button>
                  </form>
                  )
                    : auth && (
                <>
                  <div style={{cursor: "pointer"}} onClick={() => setToggleVisability(!toggleVisability)}>
                    {!toggleVisability ? <i className="far fa-eye"></i> : <i className="far fa-eye-slash"></i>}
                  </div>
                  <input
                    
                    type={toggleVisability ? "password" : "text"}
                    className="border-2 border-gray-400 p-2 w-full rounded-md"
                    placeholder="Enter your email"
                    value={databaseID}
                    readOnly
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </>
                    )
            }
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Don't know what you're doing?</p>
            <a href="https://www.npmjs.com/package/bsondb-api?activeTab=readme" className="text-blue-500 hover:underline">Read the docs</a>
            <div className="absolute top-5 left-5">
              {
                ( viewLogin || viewSignup )&& (

              <i className="fas fa-arrow-left text-blue-500 cursor-pointer" onClick={() => {
                setViewLogin(false)
                setViewSignup(false)
                setMessage(defaultMessage)
                setMessageColor('text-gray-600')
              }}></i>
                )
              }
          </div>
            <div className="absolute top-0 right-0 mt-4 mr-4">
              <i className="fas fa-info text-blue-500 cursor-pointer" onClick={() => setShowInfo(!showInfo)}></i>
              {showInfo && (
                <div className="absolute top-10 right-0 bg-gray-800 text-white p-2 rounded shadow-lg w-64 animate-fadeIn">
                  <p>
                    BsonDB is a database suitable for small projects that do not require the entirety of a cloud provider's services.
                  </p>
                </div>
            )}
          </div>
            {
              auth && 
            <div 
              style={{ fontWeight: "bold" }}
              className="absolute bottom-5 right-5 mt-4 mr-4 text-blue-900 cursor-pointer hover:underline" 
              onClick={() => setViewDB(true)}>
              Go To My Database <i className="fas fa-arrow-right"></i>
            </div>
            }
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4">
        <img src={goDropLogo} alt="GoDrop Logo" className="w-24" />
      </div>
    </div>
  );
}

export default Test;
