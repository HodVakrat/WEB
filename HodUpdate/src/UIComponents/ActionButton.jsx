export default function ActionButton(props) {
    // When disabled, dim the button and block the click (prevents double-submit).
    const buttonStyle = {
      backgroundColor: props.backgroundColor,
      color: 'white',
      margin: '5px',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1,
    };

    return (
      <button style={buttonStyle} onClick={props.onClick} disabled={props.disabled}>
        {props.text}
      </button>
    );
  }
