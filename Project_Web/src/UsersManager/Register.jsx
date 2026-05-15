import LabeledInput from '../UIComponents/LabeledInput';
import ActionButton from '../UIComponents/ActionButton';

export default function Register({ onNavigate }) {
    const handleClick = (buttonText) => {
      if(buttonText === "Register") {
        alert("Account created successfully!");
        onNavigate && onNavigate('login');
      }
    };
    return (
        <div className="bg-gray-800 p-8 rounded shadow-md w-96 justify-self-center justify-items-center mx-auto my-16 text-white border border-gray-700">
            <form id="registerForm" method="post">
                <LabeledInput label="Username" type="text" />
                <LabeledInput label="Email" type="email" />
                <LabeledInput label="Name" type="text" />
                <LabeledInput label="Password" type="password" />
                <LabeledInput label="Confirm Password" type="password" />
                <ActionButton text="Register" backgroundColor="CornflowerBlue" onClick={() => handleClick("Register")} />
            </form>
        </div>
    );
  }