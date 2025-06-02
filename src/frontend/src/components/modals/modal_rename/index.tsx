import { observer } from 'mobx-react-lite';
import Modal from 'react-modal';
import RenameModalStore from './renameModalStore';
import '../Modal.css';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../../api/auth';

interface AddBoardModalProps {
    showDesc: boolean;
}

const RenameModal = observer(({ showDesc = false }: AddBoardModalProps) => {
    const navigate = useNavigate();
    const handleRename = (new_name: string) => {
        const verifyAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            return isAuthenticated.data
        };
        verifyAuth().then((data) => RenameModalStore.rename(data.id, new_name, RenameModalStore.currentNewDescription))
    }
    const closeModal = () => {
        RenameModalStore.closeEditor();
    }
    return (
        <Modal
            isOpen={RenameModalStore.isOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            ariaHideApp={false}
            className="modal proj-modal"
        >
            <h2 className='header'>Изменить {RenameModalStore.getName()}</h2>
            <p className='p'>Название</p>
            <input autoFocus className="input" required value={RenameModalStore.currentNewName} onChange={e => RenameModalStore.changeName(e.target.value)} />
            {showDesc && <p className='p'>Описание</p>}
            {showDesc && <input autoFocus className="input" value={RenameModalStore.currentNewDescription} onChange={e => RenameModalStore.changeDesc(e.target.value)} />}
            {RenameModalStore.error && (
                <div className="error-message">{RenameModalStore.error}</div>
            )}
            <div className='button-row'>
                <button onClick={() => handleRename(RenameModalStore.currentNewName)} type="button" className='add'>Изменить</button>
                <button onClick={() => RenameModalStore.closeEditor()} type="button" className='close'>Отменить</button>
            </div>

        </Modal>
    )
}
)
export default RenameModal;
