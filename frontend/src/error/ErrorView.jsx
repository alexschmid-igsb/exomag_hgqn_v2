import * as React from 'react'
import StackTrace from "stacktrace-js"

export default function ErrorView({ title, error }) {

	const [stackTrace, setStackTrace] = React.useState(null)

	React.useEffect(() => {
		if (error.stackTrace !== undefined) {
			setStackTrace(error.stackTrace)
		} else {
			console.log("BAUE STACK TRACE FÜR " + title)
			StackTrace.fromError(error).then(setStackTrace)
		}
	}, [])

	const renderStackTrace = (stackTrace) => {
		return (
			<table className="stack-trace">
				{
					stackTrace != null ?
						stackTrace.map(item =>
							<tr>
								<td className="function">{item.functionName}</td>
								<td className="file">
									<a href={"vscode://file" + item.fileName + ":" + item.lineNumber + ":" + item.columnNumber}>
										{item.fileName}:<span className="location">{item.lineNumber}:{item.columnNumber}</span>
									</a>
								</td>
							</tr>
						)
						: null
				}
			</table>
		)
	}




	return (
		<div className="error-view">

			<h1>{title}</h1>

			<div className="error">
				<span className="name">{error.name}: </span>
				<span className="message">{error.message}</span>
				{error.status ?
					<>
						<br />
						<span className="name">StatusCode: </span>
						<span className="message">{error.status}</span>
					</>
					:
					null
				}
			</div>
			{
				renderStackTrace(stackTrace)
			}
		</div>
	)
}

