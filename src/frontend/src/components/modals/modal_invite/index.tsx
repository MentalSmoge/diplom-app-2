import { observer } from 'mobx-react-lite';
import Modal from 'react-modal';
import '../Modal.css';
import InviteModalStore from './store_invite';

const InviteModal = observer(() => {
    return (
        <Modal
            isOpen={InviteModalStore.isOpen}
            onRequestClose={() => InviteModalStore.closeModal()}
            contentLabel="Invite User Modal"
            ariaHideApp={false}
            className="modal proj-modal"
        >
            <h2 className='header'>Пригласить пользователя</h2>

            <div className="input-group">
                <p className='p'>Email пользователя</p>
                <input
                    autoFocus
                    className="input"
                    type="email"
                    value={InviteModalStore.email}
                    onChange={e => InviteModalStore.setEmail(e.target.value)}
                    placeholder="Введите email пользователя"
                />
            </div>

            {/* <div className="input-group">
                <p className='p'>Роль в проекте</p>
                <select
                    className="input"
                    value={InviteModalStore.role}
                    onChange={e => InviteModalStore.setRole(Number(e.target.value))}
                >
                    <option value="1">Участник</option>
                    <option value="2">Комментатор</option>
                    <option value="3">Редактор</option>
                </select>
            </div> */}

            {InviteModalStore.error && (
                <div className="error-message">{InviteModalStore.error}</div>
            )}

            <div className='button-row'>
                <button
                    onClick={() => InviteModalStore.sendInvite()}
                    type="button"
                    className='add'
                    disabled={InviteModalStore.isLoading}
                >
                    {InviteModalStore.isLoading ? 'Отправка...' : 'Пригласить'}
                </button>
                <button
                    onClick={() => InviteModalStore.closeModal()}
                    type="button"
                    className='close'
                >
                    Отменить
                </button>
            </div>
        </Modal>
    );
});

export default InviteModal;