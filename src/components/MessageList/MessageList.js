import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import Center from './Center';
import MessageNotification from './MessageNotification';
import CustomNotification from './CustomNotification';
import ConnectionStatus from './ConnectionStatus';
import MessageListInner from './MessageListInner';
import { defaultPinPermissions, MESSAGE_ACTIONS } from '../Message/utils';
import { checkChannelPropType, smartRender } from '../../utils';

import { ChannelContext, withTranslationContext } from '../../context';
import { Attachment } from '../Attachment';
import { Avatar } from '../Avatar';
import { MessageSimple } from '../Message';
import { EmptyStateIndicator as DefaultEmptyStateIndicator } from '../EmptyStateIndicator';
import { LoadingIndicator as DefaultLoadingIndicator } from '../Loading';
import { EventComponent } from '../EventComponent';
import { DateSeparator as DefaultDateSeparator } from '../DateSeparator';
import { TypingIndicator as DefaultTypingIndicator } from '../TypingIndicator';

/**
 * MessageList - The message list components renders a list of messages. Its a consumer of [Channel Context](https://getstream.github.io/stream-chat-react/#channel)
 *
 * @example ../../docs/MessageList.md
 * @extends PureComponent
 */
class MessageList extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      newMessagesNotification: false,
      notifications: [],
    };

    this.bottomRef = React.createRef();
    this.messageList = React.createRef();
    this.notificationTimeouts = [];
  }

  componentDidMount() {
    // start at the bottom
    this.scrollToBottom();
    const messageListRect = this.messageList.current.getBoundingClientRect();

    this.setState({
      messageListRect,
    });
  }

  componentWillUnmount() {
    this.notificationTimeouts.forEach(clearTimeout);
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (this.props.threadList) {
      return null;
    }
    // Are we adding new items to the list?
    // Capture the scroll position so we can adjust scroll later.

    if (prevProps.messages.length < this.props.messages.length) {
      const list = this.messageList.current;
      return {
        offsetTop: list.scrollTop,
        offsetBottom: list.scrollHeight - list.scrollTop,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    const userScrolledUp = this.userScrolledUp();
    const currentLastMessage = this.props.messages[
      this.props.messages.length - 1
    ];
    const previousLastMessage =
      prevProps.messages[prevProps.messages.length - 1];
    if (!previousLastMessage || !currentLastMessage) {
      return;
    }

    const hasNewMessage = currentLastMessage.id !== previousLastMessage.id;
    const isOwner = currentLastMessage.user.id === this.props.client.userID;

    const list = this.messageList.current;

    // always scroll down when it's your own message that you added...
    const scrollToBottom = hasNewMessage && (isOwner || !userScrolledUp);

    if (scrollToBottom) {
      this.scrollToBottom();

      // remove the scroll notification if we already scrolled down...
      if (this.state.newMessagesNotification)
        this.setState({ newMessagesNotification: false });

      return;
    }

    if (snapshot !== null) {
      // Maintain the offsetTop of scroll so that content in viewport doesn't move.
      // This is for the case where user has scroll up significantly and a new message arrives from someone.
      if (hasNewMessage) {
        this.scrollToTarget(snapshot.offsetTop, this.messageList.current);
      } else {
        // Maintain the bottomOffset of scroll.
        // This is for the case of pagination, when more messages get loaded.
        this.scrollToTarget(
          list.scrollHeight - snapshot.offsetBottom,
          this.messageList.current,
        );
      }
    }

    // Check the scroll position... if you're scrolled up show a little notification
    if (hasNewMessage && !this.state.newMessagesNotification) {
      this.setState({ newMessagesNotification: true });
    }
  }

  scrollToBottom = () => {
    this._scrollToRef(this.bottomRef, this.messageList);
  };

  _scrollToRef = (el, parent) => {
    const scrollDown = () => {
      if (el && el.current && parent && parent.current) {
        this.scrollToTarget(el.current, parent.current);
      }
    };

    scrollDown();
    // scroll down after images load again
    setTimeout(scrollDown, 200);
  };

  /**
   * target - target to scroll to (DOM element, scrollTop Number, 'top', or 'bottom'
   * containerEl - DOM element for the container with scrollbars
   * source: https://stackoverflow.com/a/48429314
   */
  scrollToTarget = (target, containerEl) => {
    // Moved up here for readability:
    const isElement = target && target.nodeType === 1;
    const isNumber =
      Object.prototype.toString.call(target) === '[object Number]';

    let scrollTop;
    if (isElement) scrollTop = target.offsetTop;
    else if (isNumber) scrollTop = target;
    else if (target === 'top') scrollTop = 0;
    else if (target === 'bottom')
      scrollTop = containerEl.scrollHeight - containerEl.offsetHeight;

    if (scrollTop !== undefined) containerEl.scrollTop = scrollTop; // eslint-disable-line no-param-reassign
  };

  goToNewMessages = () => {
    this.scrollToBottom();
    this.setState({ newMessagesNotification: false });
  };

  userScrolledUp = () => this.scrollOffset > 100;

  listenToScroll = (offset, reverseOffset, threshold) => {
    this.scrollOffset = offset;
    this.closeToTop = reverseOffset < threshold;
    if (this.state.newMessagesNotification && !this.userScrolledUp()) {
      this.setState({ newMessagesNotification: false });
    }
  };

  /**
   * Adds a temporary notification to message list.
   * Notification will be removed after 5 seconds.
   *
   * @param notificationText  Text of notification to be added
   * @param type              Type of notification. success | error
   */
  addNotification = (notificationText, type) => {
    if (typeof notificationText !== 'string') return;
    if (type !== 'success' && type !== 'error') return;

    const id = uuidv4();

    this.setState(({ notifications }) => ({
      notifications: [...notifications, { id, text: notificationText, type }],
    }));

    // remove the notification after 5000 ms
    const ct = setTimeout(
      () =>
        this.setState(({ notifications }) => ({
          notifications: notifications.filter((n) => n.id !== id),
        })),
      5000,
    );

    this.notificationTimeouts.push(ct);
  };

  onMessageLoadCaptured = () => {
    // A load event (emitted by e.g. an <img>) was captured on a message.
    // In some cases, the loaded asset is larger than the placeholder, which means we have to scroll down.
    if (!this.userScrolledUp() && !this.closeToTop) {
      this.scrollToBottom();
    }
  };

  loadMore = () =>
    this.props.messageLimit
      ? this.props.loadMore(this.props.messageLimit)
      : this.props.loadMore();

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <div
          className={`str-chat__list ${
            this.props.threadList ? 'str-chat__list--thread' : ''
          }`}
          ref={this.messageList}
        >
          <MessageListInner
            bottomRef={this.bottomRef}
            channel={this.props.channel}
            client={this.props.client}
            DateSeparator={this.props.DateSeparator || this.props.dateSeparator}
            disableDateSeparator={this.props.disableDateSeparator}
            EmptyStateIndicator={this.props.EmptyStateIndicator}
            HeaderComponent={this.props.HeaderComponent}
            headerPosition={this.props.headerPosition}
            hideDeletedMessages={this.props.hideDeletedMessages}
            messages={this.props.messages}
            MessageSystem={this.props.MessageSystem}
            noGroupByUser={this.props.noGroupByUser}
            onMessageLoadCaptured={this.onMessageLoadCaptured}
            read={this.props.read}
            threadList={this.props.threadList}
            TypingIndicator={this.props.TypingIndicator}
            internalInfiniteScrollProps={{
              hasMore: this.props.hasMore,
              isLoading: this.props.loadingMore,
              listenToScroll: this.listenToScroll,
              loadMore: this.loadMore,
              loader: (
                <Center key="loadingindicator">
                  {smartRender(this.props.LoadingIndicator, { size: 20 }, null)}
                </Center>
              ),
            }}
            internalMessageProps={{
              additionalMessageInputProps: this.props
                .additionalMessageInputProps,
              addNotification: this.addNotification,
              Attachment: this.props.Attachment,
              Avatar: this.props.Avatar,
              channel: this.props.channel,
              getFlagMessageSuccessNotification: this.props
                .getFlagMessageSuccessNotification,
              getFlagMessageErrorNotification: this.props
                .getFlagMessageErrorNotification,
              getMuteUserSuccessNotification: this.props
                .getMuteUserSuccessNotification,
              getMuteUserErrorNotification: this.props
                .getMuteUserErrorNotification,
              getPinMessageErrorNotification: this.props
                .getPinMessageErrorNotification,
              members: this.props.members,
              Message: this.props.Message,
              messageActions: this.props.messageActions,
              messageListRect: this.state.messageListRect,
              mutes: this.props.mutes,
              onMentionsClick: this.props.onMentionsClick,
              onMentionsHover: this.props.onMentionsHover,
              openThread: this.props.openThread,
              removeMessage: this.props.removeMessage,
              retrySendMessage: this.props.retrySendMessage,
              unsafeHTML: this.props.unsafeHTML,
              updateMessage: this.props.updateMessage,
              watchers: this.props.watchers,
              pinPermissions: this.props.pinPermissions,
            }}
          />
        </div>
        <div className="str-chat__list-notifications">
          {this.state.notifications.map((notification) => (
            <CustomNotification
              active={true}
              key={notification.id}
              type={notification.type}
            >
              {notification.text}
            </CustomNotification>
          ))}
          <ConnectionStatus />
          <MessageNotification
            onClick={this.goToNewMessages}
            showNotification={this.state.newMessagesNotification}
          >
            {t('New Messages!')}
          </MessageNotification>
        </div>
      </React.Fragment>
    );
  }
}

MessageList.propTypes = {
  /**
   * Date separator UI component to render
   *
   * Defaults to and accepts same props as: [DateSeparator](https://github.com/GetStream/stream-chat-react/blob/master/src/components/DateSeparator.js)
   * */
  dateSeparator: PropTypes.elementType,
  /** Disables the injection of date separator components, defaults to false */
  disableDateSeparator: PropTypes.bool,
  /** Hides the MessageDeleted components from the list, defaults to false */
  hideDeletedMessages: PropTypes.bool,
  /** Turn off grouping of messages by user */
  noGroupByUser: PropTypes.bool,
  /** render HTML instead of markdown. Posting HTML is only allowed server-side */
  unsafeHTML: PropTypes.bool,
  /** Set the limit to use when paginating messages */
  messageLimit: PropTypes.number,
  /**
   * Array of allowed actions on message. e.g. ['edit', 'delete', 'flag', 'mute', 'react', 'reply']
   * If all the actions need to be disabled, empty array or false should be provided as value of prop.
   * */
  messageActions: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  /**
   * Boolean weather current message list is a thread.
   */
  threadList: PropTypes.bool,
  /**
   * Function that returns message/text as string to be shown as notification, when request for flagging a message is successful
   *
   * This function should accept following params:
   *
   * @param message A [message object](https://getstream.io/chat/docs/#message_format) which is flagged.
   *
   * */
  getFlagMessageSuccessNotification: PropTypes.func,
  /**
   * Function that returns message/text as string to be shown as notification, when request for flagging a message runs into error
   *
   * This function should accept following params:
   *
   * @param message A [message object](https://getstream.io/chat/docs/#message_format) which is flagged.
   *
   * */
  getFlagMessageErrorNotification: PropTypes.func,
  /**
   * Function that returns message/text as string to be shown as notification, when request for muting a user is successful
   *
   * This function should accept following params:
   *
   * @param user A user object which is being muted
   *
   * */
  getMuteUserSuccessNotification: PropTypes.func,
  /**
   * Function that returns message/text as string to be shown as notification, when request for muting a user runs into error
   *
   * This function should accept following params:
   *
   * @param user A user object which is being muted
   *
   * */
  getMuteUserErrorNotification: PropTypes.func,
  /**
   * Function that returns message/text as string to be shown as notification, when request for pinning a message runs into error
   *
   * This function should accept following params:
   *
   * @param message A [message object](https://getstream.io/chat/docs/#message_format)
   *
   * */
  getPinMessageErrorNotification: PropTypes.func,
  /** **Available from [chat context](https://getstream.github.io/stream-chat-react/#chat)** */
  client: PropTypes.object,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  Attachment: PropTypes.elementType,
  /**
   * Custom UI component to display user avatar
   *
   * Defaults to and accepts same props as: [Avatar](https://github.com/GetStream/stream-chat-react/blob/master/src/components/Avatar/Avatar.js)
   * */
  Avatar: PropTypes.elementType,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  Message: PropTypes.elementType,
  /**
   * Custom UI component to display system messages.
   *
   * Defaults to and accepts same props as: [EventComponent](https://github.com/GetStream/stream-chat-react/blob/master/src/components/EventComponent.js)
   */
  MessageSystem: PropTypes.elementType,
  /**
   * Typing indicator UI component to render
   *
   * Defaults to and accepts same props as: [TypingIndicator](https://github.com/GetStream/stream-chat-react/blob/master/src/components/TypingIndicator/TypingIndicator.js)
   * */
  TypingIndicator: PropTypes.elementType,
  /**
   * The UI Indicator to use when MessageList or ChannelList is empty
   * */
  EmptyStateIndicator: PropTypes.elementType,
  /**
   * Component to render at the top of the MessageList
   * */
  HeaderComponent: PropTypes.elementType,
  /**
   * Component to render at the top of the MessageList while loading new messages
   * */
  LoadingIndicator: PropTypes.elementType,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  messages: PropTypes.array.isRequired,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  channel: /** @type {PropTypes.Validator<ReturnType<import('types').StreamChatReactClient['channel']>>} */ (PropTypes.objectOf(
    checkChannelPropType,
  ).isRequired),
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  updateMessage: PropTypes.func.isRequired,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  retrySendMessage: PropTypes.func,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  removeMessage: PropTypes.func,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  onMentionsClick: PropTypes.func,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  onMentionsHover: PropTypes.func,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  openThread: PropTypes.func,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  members: PropTypes.object,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  watchers: PropTypes.object,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  read: PropTypes.object,
  /**
   * Additional props for underlying MessageInput component. We have instance of MessageInput
   * component in MessageSimple component, for handling edit state.
   * Available props - https://getstream.github.io/stream-chat-react/#messageinput
   * */
  additionalMessageInputProps: PropTypes.object,
  /**
   * The user roles allowed to pin messages in various channel types
   */
  pinPermissions: /** @type {PropTypes.Validator<import('types').PinPermissions>>} */ (PropTypes.object),
};

MessageList.defaultProps = {
  Attachment,
  Avatar,
  Message: MessageSimple,
  MessageSystem: EventComponent,
  threadList: false,
  DateSeparator: DefaultDateSeparator,
  LoadingIndicator: DefaultLoadingIndicator,
  TypingIndicator: DefaultTypingIndicator,
  EmptyStateIndicator: DefaultEmptyStateIndicator,
  unsafeHTML: false,
  noGroupByUser: false,
  messageActions: Object.keys(MESSAGE_ACTIONS),
  pinPermissions: defaultPinPermissions,
};

export default withTranslationContext((props) => (
  <ChannelContext.Consumer>
    {/* TODO: only used props needs to be passed in */}
    {({ typing, ...channelContext }) => (
      <MessageList {...channelContext} {...props} />
    )}
  </ChannelContext.Consumer>
));
