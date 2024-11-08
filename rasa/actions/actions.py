import difflib
from typing import Any, Text, Dict, List
from pymongo import MongoClient
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from PIL import Image
from datetime import datetime
import os
import openai
import imaplib
import email
from email.header import decode_header

# MongoDB connection
client = MongoClient(
    'mongodb+srv://sakshirpatel29062002:APVFDuw4CUvpQZBl@health-assitant.wm6oi.mongodb.net/',
    tls=True,
    tlsAllowInvalidCertificates=True
)
db = client['Health']
disease_collection = db['disease']
medicine_collection = db['medicines']

# Set OpenAI API Key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

class ActionOperatorAgent(Action):
    def name(self) -> Text:
        return "action_operator_agent"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        issue_type = tracker.get_slot('issue_type')
        
        if issue_type == "order_tracking":
            dispatcher.utter_message(text="Let me check the status of your order.")
            return [SlotSet("operator_task", "order_tracking")]
        
        elif issue_type == "fraud_detection":
            dispatcher.utter_message(text="I will check for any fraudulent activity related to your transaction. Please email an image of the transaction to dhruvpatel77741@gmail.com with the subject line 'Fraud Report'.")
            return [SlotSet("operator_task", "fraud_detection")]
        
        elif issue_type == "product_issue":
            dispatcher.utter_message(text="Please email an image of the issue to dhruvpatel77741@gmail.com.")
            return [SlotSet("operator_task", "product_issue")]
        
        else:
            dispatcher.utter_message(text="How can I assist you?")
            return []

class ActionHandleOrderTracking(Action):
    def name(self) -> Text:
        return "action_handle_order_tracking"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        order_id = tracker.get_slot('order_id')
        
        if order_id:
            order_collection = db['orders']
            order = order_collection.find_one({"order_id": order_id})

            if order:
                order_status = order.get("orderStatus", "Unknown")
                customer_name = order.get("customerName", "Customer")
                total_amount = order.get("totalAmount", "0.00")
                
                delivery_date = order.get("delivery_date", "Unknown date")
                if isinstance(delivery_date, datetime):
                    delivery_date = delivery_date.strftime("%Y-%m-%d %H:%M:%S")

                dispatcher.utter_message(
                    text=f"Hello {customer_name}, your order '{order_id}' is currently '{order_status}'. "
                         f"The total amount is ${total_amount}, and the estimated delivery date is {delivery_date}."
                )
                
                return [
                    SlotSet("order_status", order_status),
                    SlotSet("customer_name", customer_name),
                    SlotSet("total_amount", total_amount),
                    SlotSet("delivery_date", delivery_date)
                ]
            else:
                dispatcher.utter_message(text="I couldn't find any information for that order ID.")
                return [SlotSet("order_status", "not_found")]
        else:
            dispatcher.utter_message(text="Please provide your order ID to check the status.")
            return [SlotSet("order_status", None)]

class ActionHandleProductIssue(Action):
    def name(self) -> Text:
        return "action_handle_product_issue"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        def check_email_for_images():
            EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
            EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

            if not EMAIL_USERNAME or not EMAIL_PASSWORD:
                dispatcher.utter_message(text="Email credentials are missing. Please check environment variables.")
                return None

            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            try:
                mail.login(EMAIL_USERNAME, EMAIL_PASSWORD)
                print("Successfully authenticated.")
                
                # Select the inbox and look for unseen emails
                mail.select("inbox")
                status, messages = mail.search(None, '(UNSEEN)')
                
                if not messages[0]:
                    print("No new emails found.")
                    return None  # No unseen emails

                email_ids = messages[0].split()

                # Loop through unread emails to find an attachment image
                for email_id in email_ids:
                    status, msg_data = mail.fetch(email_id, "(RFC822)")
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            for part in msg.walk():
                                if part.get_content_maintype() == "multipart":
                                    continue
                                if part.get("Content-Disposition") is None:
                                    continue
                                filename = part.get_filename()
                                if filename:
                                    filepath = os.path.join("./email_product_images", filename)
                                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                                    with open(filepath, "wb") as f:
                                        f.write(part.get_payload(decode=True))
                                    print(f"Image saved at {filepath}")
                                    return filepath
                print("No image attachments found in new emails.")
                return None
            except imaplib.IMAP4.error:
                print("Failed to authenticate. Check your email credentials.")
                dispatcher.utter_message(text="Failed to authenticate. Please check email credentials or enable app-specific password if using Gmail.")
                return None
            finally:
                mail.logout()  # Ensures logout happens even if an error occurs

        # Retrieve the image path from email
        image_path = check_email_for_images()
        
        if image_path:
            decision = self.analyze_image(image_path)
            # dispatcher.utter_message(text=f"The decision based on the image is: {decision}")
            return [SlotSet("product_issue_decision", decision)]
        else:
            dispatcher.utter_message(text="No new images found in your email. Please try sending it again.")
            return []

    def analyze_image(self, image_path: str) -> str:
        try:
            # Open the image to gather basic information
            with Image.open(image_path) as img:
                img_info = f"Image format: {img.format}, size: {img.size}, mode: {img.mode}"
            
            # Provide detailed but concise prompt to guide decision-making
            prompt = (
                "You are a customer service assistant for a delivery service. Based on the following package information, "
                "respond with one of these brief actions: 'I will initiate Refund', 'I will initiate Replacement', or 'I will Escalate to Human Agent'. "
                "If the package appears damaged, respond with 'I will initiate Refund'. If the package looks wet, respond with 'I will initiate Replacement'. "
                "If the package appears normal or it's hard to tell, respond with 'I will Escalate to Human Agent'.\n\n"
                f"Package Analysis: The image metadata indicates a {img_info}. The package in the image appears visibly "
                "damaged, with creases, tears, and other clear signs of mishandling. Based on this description, provide a one-line response."
            )

            # Use the OpenAI API with gpt-4-turbo (or gpt-4o-mini if applicable)
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for customer service product issue resolution."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,  # Limit to 10 tokens to enforce a brief response
                temperature=0.3  # Lower temperature for more deterministic answers
            )

            # Extract the response
            decision = response.choices[0].message['content'].strip()
            print("OpenAI API response:", decision)
            return decision if decision else "Escalate to Human-Agent"
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return "Escalate to Human-Agent"

class ActionHandleFraudDetection(Action):
    def name(self) -> Text:
        return "action_handle_fraud_issue"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        def check_email_for_images():
            EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
            EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

            if not EMAIL_USERNAME or not EMAIL_PASSWORD:
                dispatcher.utter_message(text="Email credentials are missing. Please check environment variables.")
                return None

            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            try:
                mail.login(EMAIL_USERNAME, EMAIL_PASSWORD)
                print("Successfully authenticated.")
                
                mail.select("inbox")
                status, messages = mail.search(None, '(UNSEEN)')
            
                if not messages[0]:
                    print("No new emails found")
                    return None  # No unseen emails

                email_ids = messages[0].split()
                for email_id in email_ids:
                    status, msg_data = mail.fetch(email_id, "(RFC822)")
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            for part in msg.walk():
                                if part.get_content_maintype() == "multipart":
                                    continue
                                if part.get("Content-Disposition") is None:
                                    continue
                                filename = part.get_filename()
                                if filename:
                                    filepath = os.path.join("./email_fraud_images", filename)
                                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                                    with open(filepath, "wb") as f:
                                        f.write(part.get_payload(decode=True))
                                    print(f"Image saved at {filepath}")
                                    return filepath
                print("No image attachments found in new emails.")
                return None
            except imaplib.IMAP4.error:
                print("Failed to authenticate. Check your email credentials.")
                dispatcher.utter_message(text="Failed to authenticate. Check your email credentials or enable app-specific password if using Gmail.")
                return None
            finally:
                mail.logout()
        
        image_path = check_email_for_images()

        if image_path:
            decision = self.analyze_fraud_image(image_path)
            return [SlotSet("fraud_issue_decision", decision)]
        else:
            dispatcher.utter_message(text="No new image found in your email. Please try sending it again.")
            return []

    def analyze_fraud_image(self, image_path: str) -> str:
        try:
            with Image.open(image_path) as img:
                img_info = f"Image format: {img.format}, size: {img.size}, mode: {img.mode}"
            
            prompt = (
            "You are a customer service assistant specializing in fraud detection for a delivery service. "
            "Analyze the following receipt or payment information and respond with one of these actions: "
            "'Refund', 'Decline', or 'Escalate to Human-Agent'.\n\n"
            "Guidelines:\n"
            "- If there are clear signs of manipulation (e.g., altered amounts, suspicious inconsistencies in data), respond with 'Refund'.\n"
            "- If the document appears legitimate, with no signs of tampering or unusual patterns, respond with 'Decline'.\n"
            "- If the document is unclear or does not provide enough information to make a decision, respond with 'Escalate to Human-Agent'.\n\n"
            f"Document Metadata: The image format is {img_info}. "
            "Visible details include payment information, transaction numbers, and other relevant document data. "
            "Please review this information carefully to provide an appropriate response."
        )

            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for customer service fraud detection."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.4
            )

            decision = response.choices[0].message['content'].strip()
            print("OpenAI API Response:", decision)
            return decision if decision else "Escalate to Human-Agent"
        except Exception as e:
            print("Error analyzing image: {e}")
            return "Escalate to Human-Agent"

class ActionGreetUser(Action):
    def name(self) -> Text:
        return "action_greet_user"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Hello! How can I assist you today?")
        return []

class ActionProcessSymptoms(Action):
    def name(self) -> Text:
        return "action_process_symptoms"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        symptoms = tracker.get_slot('symptoms')
        if symptoms:
            query = {"symptom_name": {"$regex": symptoms, "$options": "i"}}
            disease = disease_collection.find_one(query)
            if disease:
                severity_levels = [s["level"] for s in disease["severity"]]
                buttons = [{"title": level, "payload": f'/select_severity{{"severity":"{level}"}}'} for level in severity_levels]
                dispatcher.utter_message(text="Please select the severity of your symptoms:", buttons=buttons)
                return []
            else:
                dispatcher.utter_message(text="I couldn't find any information related to your symptoms.")
                return [SlotSet("symptoms", None)]
        return []

class ActionProvideMedicine(Action):
    def name(self) -> Text:
        return "action_provide_medicine"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        selected_severity = tracker.get_slot('severity')
        symptoms = tracker.get_slot('symptoms')
        
        if symptoms and selected_severity:
            query = {"symptom_name": {"$regex": symptoms, "$options": "i"}}
            disease = disease_collection.find_one(query)
            
            if disease:
                severity_data = next((s for s in disease["severity"] if s["level"].lower() == selected_severity.lower()), None)
                if severity_data:
                    medicine_ids = severity_data["medicines"]
                    medicines = [medicine_collection.find_one({"_id": med_id}) for med_id in medicine_ids]
                    medicine_names = [med["medicine_name"] for med in medicines if med]
                    dispatcher.utter_message(text=f"The recommended medicines are: {', '.join(medicine_names)}")
                    return [SlotSet("medicine_ids", medicine_ids)]
        dispatcher.utter_message(text="Sorry, I couldn't find any matching medicines.")
        return [SlotSet("medicine_ids", None)]

class ActionMedicineDetails(Action):
    def name(self) -> str:
        return "action_medicine_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        selected_medicine = tracker.get_slot('selected_medicine')

        if selected_medicine:
            query = {"medicine_name": {"$regex": f"^{selected_medicine}$", "$options": "i"}}
            medicine = medicine_collection.find_one(query)
            
            if medicine:
                base_url = "http://localhost:3000"
                image_path = medicine.get('image', '')
                full_image_url = f"{base_url}/{image_path}" if image_path else None
                
                dosage = medicine.get('dosage', 'Not specified')
                description = medicine.get('description', 'No description available.')
                price = medicine.get('price', 'Price not available.')

                if full_image_url:
                    dispatcher.utter_message(image=full_image_url)
                
                dispatcher.utter_message(
                    text=f"The price of {medicine['medicine_name']} is {price}.\n"
                         f"Description: {description}\n"
                         f"Dosage: Take {dosage}."
                )
                return []
            else:
                dispatcher.utter_message(text="Sorry, I couldn't find information on that medicine.")
                return [SlotSet("selected_medicine", None)]
        else:
            dispatcher.utter_message(text="Please specify the name of the medicine you'd like to know more about.")
        return []

class ActionProvideSideEffects(Action):
    def name(self) -> str:
        return "action_provide_side_effects"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        selected_medicine = tracker.get_slot('selected_medicine')

        if selected_medicine:
            query = {"medicine_name": {"$regex": f"^{selected_medicine}$", "$options": "i"}}
            medicine = medicine_collection.find_one(query)
            
            if medicine:
                if "side_effects" in medicine and medicine['side_effects']:
                    side_effects = ", ".join(medicine['side_effects'])
                    dispatcher.utter_message(
                        text=f"The side effects of {medicine['medicine_name']} are: {side_effects}."
                    )
                else:
                    dispatcher.utter_message(
                        text=f"Sorry, side effects for {medicine['medicine_name']} are not available."
                    )

                buttons = [
                    {"title": "Yes", "payload": '/confirm_purchase_yes_no{"response":"yes"}'},
                    {"title": "No", "payload": '/confirm_purchase_yes_no{"response":"no"}'}
                ]
                dispatcher.utter_message(text="Would you like to buy this medicine?", buttons=buttons)
            else:
                dispatcher.utter_message(text="Sorry, I couldn't find information on that medicine.")
        else:
            dispatcher.utter_message(text="Please specify the medicine you're asking about.")
        return []

class ActionConfirmPurchase(Action):
    def name(self) -> str:
        return "action_confirm_purchase"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        user_response = tracker.get_slot('response')
        selected_medicine = tracker.get_slot('selected_medicine')
        
        query = {"medicine_name": {"$regex": f"^{selected_medicine}$", "$options": "i"}}
        medicine = medicine_collection.find_one(query)
        medId = medicine.get('_id', 'No ID Found')

        if user_response == "yes" and medId != 'No ID Found':
            checkout_url = f"http://localhost:3000/medicine/{medId}"
            dispatcher.utter_message(text=f"Please visit: [Checkout Page]({checkout_url})")
        else:
            dispatcher.utter_message(text="Thank you! How may I assist you further?")
        return []
