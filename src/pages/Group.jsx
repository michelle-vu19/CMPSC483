import React from "react";
import { DashboardWrapperRight } from "../components/dashboard-wrapper/DashboardWrapper";
import DashboardWrapperRest, {
  DashboardWrapperMainRest,
} from "../components/dashboard-wrapper-rest/DashboardWrapperRest";
import SummaryBox, {
  SummaryBoxSpecial,
} from "../components/summary-box/SummaryBox";
import { colors, data2 } from "../constants";

import OverallList from "../components/overall-list/OverallList";

const Group = () => {
  return (
    <DashboardWrapperRest>
      <DashboardWrapperMainRest>
        <div className="row">
          <div className="col-12 col-md-12">
            <div className="row">
              {data2.summary.map((item, index) => (
                <div
                  key={`summary-${index}`}
                  className="col-6 col-md-6 col-sm-12 mb"
                >
                  <SummaryBox item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardWrapperMainRest>
    </DashboardWrapperRest>
  );
};

export default Group;
