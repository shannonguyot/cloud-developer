import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchTodo } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any,
  name: string,
  dueDate: string,
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    name: "",
    dueDate: "",
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    this.setState({
      name: name
    })
  }

  handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value
    this.setState({
      dueDate: date
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    
    event.preventDefault()

    if (!this.state.file && this.state.name == "" && this.state.dueDate == "") {
      alert('There are no changes to save.')
      return
    }

    if(this.state.file)
    {
      try {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

        alert('File was uploaded!')
      } catch (e) {
        alert('Could not upload a file: ' + e.message)
      } finally {
        this.setUploadState(UploadState.NoUpload)
      }
    }

    if(this.state.name != "" || this.state.dueDate != "")
    {
      try {
        await patchTodo(this.props.auth.getIdToken(), this.props.match.params.todoId, {
          name: this.state.name,
          dueDate: this.state.dueDate,
          done: false
        })
      } catch {
        alert('Todo update failed.')
      } finally {
        alert('Update completed')
      }
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Edit Todo</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Todo Image</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Todo Name</label>
            <input
              type="text"
              placeholder="New todo name"
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Todo Due Date</label>
            <input
              type="date"
              onChange={this.handleDateChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Apply Changes
        </Button>
      </div>
    )
  }
}
