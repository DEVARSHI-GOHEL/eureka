import React from 'react';
import ModalFail from '../../Components/ModalFail/ModalFail';
import {useDispatch, useSelector} from 'react-redux';
import {isIncompatible} from './redux/selectors';
import {hideIncompatibleDeviceDialog} from './redux/actions';
import {useTranslation} from '../../Services/Translate';
import FirmwareUpdateScreen from '../../Containers/FirmwareUpdateScreen';
import {ModalOnWatchShutdown} from '../../Components/ModalOnWatchShutdown';
import {ModalMeasureFailed} from '../../Components/ModalMeasureFailed';
import {ModalSkinNotDetected} from '../../Components/ModalSkinNotDetected';

const ApplicationOverlay = () => {
  const incompatibleTrn = useTranslation('incompatibleDeviceModal');
  const dispatch = useDispatch();
  const isIncompatibleVisible = useSelector(isIncompatible);

  return (
    <>
      <FirmwareUpdateScreen />
      <ModalFail
        title={incompatibleTrn.title}
        content={incompatibleTrn.content}
        onClose={() => {
          dispatch(hideIncompatibleDeviceDialog());
        }}
        modalVisible={isIncompatibleVisible}
        buttonOKText={incompatibleTrn.OK_button}
      />
      <ModalOnWatchShutdown />
      <ModalMeasureFailed />
      <ModalSkinNotDetected />
    </>
  );
};

export default ApplicationOverlay;
