import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { CodeBlock } from "../pages/Rules";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Caught error:", error);
    this.setState({ hasError: true, message: error.toString() });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent message={this.state.message} />;
    }
    return this.props.children;
  }
}

function ErrorComponent({ message }) {
  const { t } = useTranslation(undefined, { keyPrefix: "general" });
  return (
    <>
      <Typography variant="h6" color="error">
        Something went wrong!
      </Typography>
      <Typography variant="body1" color="error">
        Try refreshing your browser's cache (Ctrl + F5 in Firefox, Shift + F5 in Chrome) or ask in #gb-report
        if the problem persists.
      </Typography>
      {message && (
        <Typography variant="body1" color="error">
          Error that occurred: <CodeBlock>{message}</CodeBlock>
        </Typography>
      )}
    </>
  );
}
