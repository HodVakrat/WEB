export default function LabeledInput(props) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{props.label}</label>
        <input className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" type={props.type} disabled={props.disabled} value={props.value} onChange={props.onChange} />
      </div>
    );
}
