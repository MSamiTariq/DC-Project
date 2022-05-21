import React from "react"
import ErrorMsg from "../Utils/ErrorMsg"
import TextField from "@material-ui/core/TextField"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import { useSnackbar } from "notistack"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const initialValues = {
  email: "",
  phoneNumber: "",
  report: "",
  subject: "",
}

const validationSchema = Yup.object({
  report: Yup.string().required("Report is required"),

  subject: Yup.string().required("Subject is required"),

  email: Yup.string()
    .matches(
      /([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)/,
      "Enter Valid email address!"
    )
    .required("Email address is required"),
  phoneNumber: Yup.string()
    .matches(
      /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/,
      "Enter a valid phone number"
    )
    .required("Phone number is Required"),
})

export default function Home() {
  const { enqueueSnackbar } = useSnackbar()

  const reportSubmit = async (values, actions) => {
    try {
      var myHeaders = new Headers()
      myHeaders.append("Content-Type", "application/json")

      var raw = JSON.stringify({
        to: values.email,
        from: "info@msami.ml",
        text: values.report,
        subject: values.subject,
        PhoneNumber: values.phoneNumber,
      })

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          to: values.email,
          from: "info@msami.ml",
          text: values.report,
          subject: values.subject,
          PhoneNumber: values.phoneNumber,
        }),
      }

      const response: any = await fetch(
        "https://44kadn6yx7.execute-api.us-west-2.amazonaws.com/prod/sendreport",
        requestOptions
      )

      enqueueSnackbar("Report successfully sent!", {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })

      actions.resetForm({
        values: {
          report: "",
          email: "",
          subject: "",
          phoneNumber: "",
        },
      })
    } catch (error) {
      enqueueSnackbar("Failed to to send the report!", {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })
      console.log(error)
    }
  }

  return (
    <div className="main">
      <div className="form">
        <Paper elevation={9}>
          <h1 className="heading1">Lab Report Service</h1>
          <Formik
            initialValues={initialValues}
            onSubmit={reportSubmit}
            validationSchema={validationSchema}
          >
            <Form className="form">
              <Field
                as={TextField}
                id="Title"
                type="text"
                label="Email"
                variant="outlined"
                name="email"
                fullWidth
                style={{ marginTop: "10px" }}
              />
              <ErrorMessage name="email" component={ErrorMsg} />

              <Field
                as={TextField}
                id="URL"
                type="text"
                name="phoneNumber"
                label="Phone Number"
                variant="outlined"
                fullWidth
                style={{ marginTop: "10px" }}
              />
              <ErrorMessage name="phoneNumber" component={ErrorMsg} />

              <Field
                as={TextField}
                id="Subject"
                label="Subject"
                multiline
                type="text"
                rows={4}
                fullWidth
                variant="outlined"
                name="subject"
                style={{ marginTop: "10px" }}
              />
              <ErrorMessage name="subject" component={ErrorMsg} />

              <Field
                as={TextField}
                id="report"
                label="Report"
                multiline
                type="text"
                rows={4}
                fullWidth
                variant="outlined"
                name="report"
                style={{ marginTop: "10px" }}
              />
              <ErrorMessage name="report" component={ErrorMsg} />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                style={{ marginTop: "10px", marginBottom: "15px" }}
              >
                Send Report
              </Button>
            </Form>
          </Formik>
        </Paper>
      </div>
    </div>
  )
}
