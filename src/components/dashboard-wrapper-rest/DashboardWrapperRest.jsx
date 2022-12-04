import React from "react";
import "./dashboard-wrapper-rest.scss";

const DashboardWrapperRest = (props) => {
  return <div className="dashboard-wrapper-rest">{props.children}</div>;
};

export default DashboardWrapperRest;

export const DashboardWrapperMainRest = (props) => {
  return <div className="dashboard-wrapper__main">{props.children}</div>;
};
