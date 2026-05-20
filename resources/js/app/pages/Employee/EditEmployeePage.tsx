import { useParams } from 'react-router-dom';
import EmployeeForm from '@/app/components/Employee/EmployeeForm';

export default function EditEmployeePage() {
    const { id } = useParams();
    return <EmployeeForm employeeId={id} />;
}
