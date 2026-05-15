import LabeledInput from '../UIComponents/LabeledInput';
import ActionButton from '../UIComponents/ActionButton';

export default function Login({ onNavigate }) {
    const handleClick = (buttonText) => {
        if(buttonText === "Login"){
            alert("Logging in...");
            onNavigate && onNavigate('dashboard');
        }
        else if(buttonText === "Register"){
            onNavigate && onNavigate('register');
        }
    };
    return (
        <div className="bg-gray-800 p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 text-white border border-gray-700">
            <form id="loginForm" method="post">
                <LabeledInput label="Username or Email" type="text" />
                <LabeledInput label="Password" type="password" />
                <ActionButton text="Login" backgroundColor="CornflowerBlue" onClick={() => handleClick("Login")} />
                <ActionButton text="Register" backgroundColor="Gray" onClick={() => handleClick("Register")} />
            </form>
        </div>
    );
  }