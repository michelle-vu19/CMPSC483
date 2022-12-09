import React, { Component } from "react";

class DynamicTable extends Component {
  state = {
    data: [
      { name: "John", age: 25, gender: "male" },
      { name: "Jane", age: 21, gender: "female" },
      { name: "Alex", age: 31, gender: "male" },
    ],
  };

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

const Students = () => {
  const myInstance = new DynamicTable();
  return <div>{myInstance.render()}</div>;
};

export default Students;
