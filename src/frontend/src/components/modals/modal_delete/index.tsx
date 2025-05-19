import { observer } from 'mobx-react-lite';
import Modal from 'react-modal';
import DeleteModalStore from './DeleteModalStore';
import '../Modal.css';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../../api/auth';
// interface DeleteModalProps {
//     type: string;
// }
const DeleteModal = observer(() => {
    const navigate = useNavigate();
    const handleDelete = () => {
        const verifyAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            return isAuthenticated.data
        };
        verifyAuth().then((data) => DeleteModalStore.delete(data.id))
    }
    const closeModal = () => {
        DeleteModalStore.closeEditor();
    }
    return (
        <Modal
            isOpen={DeleteModalStore.isOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            ariaHideApp={false}
            className="modal"
        >
            <h2 className='header'>Удалить {DeleteModalStore.getName()}?</h2>
            <div className='button-row'>
                <button onClick={() => handleDelete()} type="button" className='delete'>Да</button>
                <button onClick={() => DeleteModalStore.closeEditor()} type="button" className='close'>Нет</button>
            </div>
        </Modal>
    )
}
)
export default DeleteModal;
