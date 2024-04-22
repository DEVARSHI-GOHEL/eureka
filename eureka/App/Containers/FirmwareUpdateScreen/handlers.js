import {dispatch} from "../../../store/store";
import {firmwareUpdateResultError} from "./redux/actions";

export const firmwareUpdateFail = (message) => {
  dispatch(firmwareUpdateResultError(message));
}
