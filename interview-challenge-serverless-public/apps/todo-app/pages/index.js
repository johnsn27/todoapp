import React from "react"

const Preamble = () => (
  <>
    <h1>Welcome to the ATG To-Do App</h1>
    <p>
      This is a simple project, with two packages, an app (this!), and a Lambda
      based API service.
    </p>
  </>
)

function HomePage() {
  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <Preamble />
      <p>
        <a href="/todos">Take a look at the list of To-Dos.</a>
      </p>
    </div>
  )
}

export default HomePage
