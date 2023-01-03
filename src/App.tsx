import { ChangeEventHandler, RefCallback } from 'react';
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import './App.css';

export interface IColumnSelection {
  selected: string,
}

export interface ISelectionData {
  selections: IColumnSelection[];
}

const initialComoboBoxValues = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
  { label: 'E', value: 'E' }
];

let formValues: ISelectionData = {
  selections: [
    { selected: 'A' },
    { selected: 'B' },
    { selected: 'C' }
  ]
};

export const Selection = ({ prefix, selectionHandler, selectedOptions, selected, deleteFn }:
  {
    prefix: string,
    selectedOptions: string[],
    selectionHandler: { onChange: ChangeEventHandler, onBlur: ChangeEventHandler, ref: RefCallback<HTMLSelectElement> }
    selected: string,
    deleteFn: () => void
  }) => {

  let forbidden = selectedOptions.filter(v => v !== selected);
  let allowed = initialComoboBoxValues.filter(cbv => !forbidden.find(v => v === cbv.value));
  return (<div>
    {/* the issue can be fixed when value={selected} is added, but I don't understand why it should be necessary */}
    <select {...selectionHandler}>
      {allowed.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
    <button type='button' onClick={deleteFn}>delete</button>
    Debug Info:
    Selected is {selected},
    allowed value are {JSON.stringify(allowed.map(v => v.value))}
  </div>)
}

export default function App() {
  const methods = useForm({ defaultValues: formValues });
  let control = methods.control;
  const { fields, remove } = useFieldArray({
    control,
    name: "selections",
  });

  const data = useWatch({
    control,
    name: "selections",
  });
  let selectedOptions = data.map(sel => sel.selected);

  return (
    <>
    <p>
      This is a somewhat complex example. Each select box allows values 'A' to 'E', but each
      list box must have a distinct value. 
      The options for each select box should show only valid values (i.e. must filter the values that are already selected.)
      </p>
      <p>
      There's a issue with the implemenation: Click on the delete button next to "B". The expectation is that A and C remain visible. 
      But instead the second box has D selected. 
      The debug info shows that the state as observed with useWatch is acutally "C", which would be correct.
      Just for the fun of it you can select "D" in the first select box, which causes the second box to show "B" afterwards.
      </p>
      <FormProvider {...methods} >
        <form className="main">
          <div className="column">
            {
              fields.map((field, rowIndex) =>
                <Selection key={field.id}
                  selectionHandler={methods.register(`selections.${rowIndex}.selected`)}
                  selected={selectedOptions[rowIndex]}
                  selectedOptions={selectedOptions} prefix={`selections.${rowIndex}`}
                  deleteFn={() => remove(rowIndex)}
                />)
            }
          </div>
        </form>
        <pre>{JSON.stringify(data)}</pre>
      </FormProvider>
    </>
  );
}
