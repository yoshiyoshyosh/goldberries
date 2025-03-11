import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { CodeBlock } from "../pages/Rules";
import { useTheme } from "@emotion/react";

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
  const theme = useTheme();
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
      <Typography variant="body1" color="error" sx={{ mt: 1, fontWeight: "bold" }}>
        IF YOU ASK IN #gb-report, include the following information:
      </Typography>
      <ul style={{ color: theme.palette.error.main }}>
        <li>The URL that the error happened on</li>
        <li>A detailed explanation of what you were trying to do</li>
        <li>What you expected to happen</li>
      </ul>
    </>
  );
}
