import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

export default function ExpenseTable({ items, openFile, deleteRecord }: any) {
	return (
		<Table sx={{ mx: 'auto', width: 'auto' }}>
			<TableHead>
				<TableRow>
					<TableCell align='center'>Date</TableCell>
					<TableCell>Amount</TableCell>
					<TableCell align='center'>Description</TableCell>
					<TableCell align='center'>File</TableCell>
					<TableCell align='center'>Action</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{items.map(({ date, amount, description, file }: any) => (
					<TableRow key={date}>
						<TableCell align='center'>{new Date(date).toLocaleString()}</TableCell>
						<TableCell>&#8377; {amount}</TableCell>
						<TableCell align='center'>{description}</TableCell>
						<TableCell align='center'>{file && <Button onClick={() => openFile(file)}>Open File</Button>}</TableCell>
						<TableCell align='center'><Button onClick={() => deleteRecord(date, file)}>Delete Record</Button></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}