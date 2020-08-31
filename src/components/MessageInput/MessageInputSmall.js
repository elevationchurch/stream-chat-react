// @ts-check
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
// @ts-ignore
import { ImageDropzone, FileUploadButton } from 'react-file-utils';
import { TranslationContext, ChannelContext } from '../../context';
import { ChatAutoComplete } from '../ChatAutoComplete';
import { Tooltip } from '../Tooltip';
import useMessageInput from './hooks/messageInput';
import UploadsPreview from './UploadsPreview';
import EmojiPicker from './EmojiPicker';
import SendButtonComponent from './SendButton';

/** @type {React.FC<import("types").MessageInputProps>} */
const MessageInputSmall = (props) => {
  const messageInput = useMessageInput(props);
  /** @type {import("types").ChannelContextValue} */
  const channelContext = useContext(ChannelContext);
  /** @type {import("types").TranslationContextValue} */
  const { t } = useContext(TranslationContext);
  const { SendButton } = props;

  return (
    <div className="str-chat__small-message-input__wrapper">
      <ImageDropzone
        accept={channelContext.acceptedFiles}
        multiple={channelContext.multipleUploads}
        disabled={
          channelContext.maxNumberOfFiles !== undefined &&
          messageInput.numberOfUploads >= channelContext.maxNumberOfFiles
        }
        handleFiles={messageInput.uploadNewFiles}
      >
        <div
          className={`str-chat__small-message-input ${
            SendButton
              ? 'str-chat__small-message-input--send-button-active'
              : null
          }`}
        >
          <UploadsPreview {...messageInput} />
          <EmojiPicker {...messageInput} small />
          <div className="str-chat__small-message-input--textarea-wrapper">
            <ChatAutoComplete
              commands={messageInput.getCommands()}
              innerRef={messageInput.textareaRef}
              handleSubmit={messageInput.handleSubmit}
              onChange={messageInput.handleChange}
              value={messageInput.text}
              rows={1}
              maxRows={props.maxRows}
              onSelectItem={messageInput.onSelectItem}
              placeholder={t('Type your message')}
              onPaste={messageInput.onPaste}
              grow={props.grow}
              disabled={props.disabled}
              additionalTextareaProps={props.additionalTextareaProps}
            />

            <div className="str-chat__emojiselect-wrapper">
              <Tooltip>{t('Choose a reaction')}</Tooltip>
              <span
                className="str-chat__small-message-input-emojiselect"
                onClick={messageInput.openEmojiPicker}
              >
                <svg
                  width="33px"
                  height="34px"
                  viewBox="0 0 33 34"
                  version="1.1"
                >
                  <g
                    id="Live"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="Live/Chat"
                      transform="translate(-364.000000, -1785.000000)"
                      fillRule="nonzero"
                    >
                      <g
                        id="Reaction-icon"
                        transform="translate(365.500000, 1785.500000)"
                      >
                        <g id="Group" transform="translate(0.418919, 7.608163)">
                          <path
                            d="M11.9874974,23.9749948 C18.609623,23.9749948 23.9749948,18.609623 23.9749948,11.9874974 C23.9749948,5.36537182 18.609623,-1.24618264e-13 11.9874974,-1.24618264e-13 C5.36537182,-1.24618264e-13 8.52651283e-14,5.36537182 8.52651283e-14,11.9874974"
                            id="Path"
                            stroke="#fff"
                            strokeWidth="2"
                            transform="translate(11.987497, 11.987497) rotate(-180.000000) translate(-11.987497, -11.987497) "
                          />
                          <path
                            d="M15.8544321,10.4407235 C16.7100008,10.4407235 17.4012059,9.74951842 17.4012059,8.89394969 C17.4012059,8.03838096 16.7100008,7.34717583 15.8544321,7.34717583 C14.9988633,7.34717583 14.3076582,8.03838096 14.3076582,8.89394969 C14.3076582,9.74951842 14.9988633,10.4407235 15.8544321,10.4407235 Z"
                            id="Path"
                            fill="#fff"
                          />
                          <path
                            d="M8.12056276,10.4407235 C8.97613149,10.4407235 9.66733662,9.74951842 9.66733662,8.89394969 C9.66733662,8.03838096 8.97613149,7.34717583 8.12056276,7.34717583 C7.26499403,7.34717583 6.5737889,8.03838096 6.5737889,8.89394969 C6.5737889,9.74951842 7.26499403,10.4407235 8.12056276,10.4407235 Z"
                            id="Path"
                            fill="#fff"
                          />
                          <path
                            d="M12.3161774,19.3346732 C15.3227285,19.3346732 17.8072529,17.1208626 18.1697781,14.2593215 C18.2181147,13.872628 17.9135559,13.5342713 17.5172328,13.5342713 L6.45776198,13.5342713 C6.06143894,13.5342713 5.75688007,13.872628 5.80521676,14.2593215 C6.16774188,17.1208626 8.65226627,19.3346732 11.6588174,19.3346732 L12.3161774,19.3346732 Z"
                            id="Path"
                            fill="#fff"
                          />
                        </g>
                        <path
                          d="M24.7314015,13.608163 C24.886789,13.608163 25.0126508,13.4823012 25.0126508,13.3269137 L25.0126508,7.70192712 L30.6376374,7.70192712 C30.7930249,7.70192712 30.9188867,7.5760653 30.9188867,7.42067779 L30.9188867,6.29568048 C30.9188867,6.14029297 30.7930249,6.01443115 30.6376374,6.01443115 L25.0126508,6.01443115 L25.0126508,0.389444557 C25.0126508,0.234057049 24.886789,0.108195228 24.7314015,0.108195228 L23.6064042,0.108195228 C23.4510167,0.108195228 23.3251548,0.234057049 23.3251548,0.389444557 L23.3251548,6.01443115 L17.7001682,6.01443115 C17.5447807,6.01443115 17.4189189,6.14029297 17.4189189,6.29568048 L17.4189189,7.42067779 C17.4189189,7.5760653 17.5447807,7.70192712 17.7001682,7.70192712 L23.3251548,7.70192712 L23.3251548,13.3269137 C23.3251548,13.4823012 23.4510167,13.608163 23.6064042,13.608163 L24.7314015,13.608163 Z"
                          id="P"
                          fill="#fff"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </span>
            </div>

            <div
              className="str-chat__fileupload-wrapper"
              data-testid="fileinput"
            >
              <Tooltip>{t('Attach files')}</Tooltip>
              <FileUploadButton
                multiple={channelContext.multipleUploads}
                disabled={
                  channelContext.maxNumberOfFiles !== undefined &&
                  messageInput.numberOfUploads >=
                    channelContext.maxNumberOfFiles
                }
                accepts={channelContext.acceptedFiles}
                handleFiles={messageInput.uploadNewFiles}
              >
                <span className="str-chat__small-message-input-fileupload">
                  <svg
                    width="14"
                    height="14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>{t('Attach files')}</title>
                    <path
                      d="M7 .5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5S.5 10.59.5 7 3.41.5 7 .5zm0 12c3.031 0 5.5-2.469 5.5-5.5S10.031 1.5 7 1.5A5.506 5.506 0 0 0 1.5 7c0 3.034 2.469 5.5 5.5 5.5zM7.506 3v3.494H11v1.05H7.506V11h-1.05V7.544H3v-1.05h3.456V3h1.05z"
                      fillRule="nonzero"
                    />
                  </svg>
                </span>
              </FileUploadButton>
            </div>
          </div>
          {SendButton && <SendButton sendMessage={messageInput.handleSubmit} />}
        </div>
      </ImageDropzone>
    </div>
  );
};

MessageInputSmall.propTypes = {
  /** Set focus to the text input if this is enabled */
  focus: PropTypes.bool.isRequired,
  /** Grow the textarea while you're typing */
  grow: PropTypes.bool.isRequired,
  /** Specify the max amount of rows the textarea is able to grow */
  maxRows: PropTypes.number.isRequired,
  /** Make the textarea disabled */
  disabled: PropTypes.bool,
  /**
   * Any additional attrubutes that you may want to add for underlying HTML textarea element.
   */
  additionalTextareaProps: PropTypes.object,
  /**
   * @param message: the Message object to be sent
   * @param cid: the channel id
   */
  overrideSubmitHandler: PropTypes.func,
  /** Override image upload request */
  doImageUploadRequest: PropTypes.func,
  /** Override file upload request */
  doFileUploadRequest: PropTypes.func,
  /**
   * Custom UI component for send button.
   *
   * Defaults to and accepts same props as: [SendButton](https://getstream.github.io/stream-chat-react/#sendbutton)
   * */
  // @ts-ignore
  SendButton: PropTypes.elementType,
};

MessageInputSmall.defaultProps = {
  focus: false,
  disabled: false,
  grow: true,
  maxRows: 10,
  SendButton: SendButtonComponent,
  additionalTextareaProps: {},
};

export default MessageInputSmall;
