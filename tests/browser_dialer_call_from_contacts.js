
function test() {
  waitForExplicitFinish();
  let url = '../dialer/dialer.html';

  getWindowManager(function(windowManager) {
    var testContact;
    function onReady(dialerFrame) {
      let dialerWindow = dialerFrame.contentWindow;

      // creating a contact
      testContact = new mozContact();
      testContact.init({
        givenName: 'Tom',
        familyName: 'Testing',
        name: 'Tom Testing',
        tel: '123-456-789'
      });

      var req = navigator.mozContacts.save(testContact);
      req.onsuccess = function() {
        var keyboardTab = dialerWindow.document.getElementById('keyboard-label');
        EventUtils.sendMouseEvent({type: 'click'}, keyboardTab);

        var contactTab = dialerWindow.document.getElementById('contacts-label');
        EventUtils.sendMouseEvent({type: 'click'}, contactTab);

        ok(!dialerWindow.document.getElementById('contacts-view').hidden,
           'Contact view displayed');

        waitFor(function() {
          var listId = 'contacts-container';
          var contactsList = dialerWindow.document.getElementById(listId);
          var aContact = contactsList.querySelector('.contact');
          EventUtils.sendMouseEvent({type: 'click'}, aContact);

          var overlay = dialerWindow.ContactDetails.overlay;

          overlay.addEventListener('transitionend', function trWait() {
            overlay.removeEventListener('transitionend', trWait);

            ok(overlay.classList.contains('displayed'), 'Overlay view displayed');

            var number = dialerWindow.ContactDetails.contactPhone;
            var callScreen = dialerWindow.CallHandler.callScreen;

            EventUtils.sendMouseEvent({type: 'click'}, number);
            callScreen.addEventListener('transitionend', function trWait() {
              callScreen.removeEventListener('transitionend', trWait);
              ok(callScreen.classList.contains('oncall'), 'CallScreen displayed');

              windowManager.closeForegroundWindow();
            });
          });
        }, function() {
          return (('Contacts' in dialerWindow) && dialerWindow.Contacts._loaded);
        });
      };
    }

    function onClose() {
      navigator.mozContacts.remove(testContact);
      windowManager.kill(url);
      finish();
    }

    let appFrame = windowManager.launch(url).element;
    ApplicationObserver(appFrame, onReady, onClose);
  });
}
