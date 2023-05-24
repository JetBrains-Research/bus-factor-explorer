import React, {useEffect} from "react";
import QueryAssist from "@jetbrains/ring-ui/dist/query-assist/query-assist";


export function TimeoutInput(props) {

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.onTimeout()
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [props.value]);

  return (
    <QueryAssist
      placeholder={"Find project in Github"}
      huge={true}
      icon={props.icon}
      label={props.label}
      onChange={props.onChange}
      dataSource={() => {}}
    />
  )
}