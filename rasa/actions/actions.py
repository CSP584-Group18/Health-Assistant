import difflib
from typing import Any, Text, Dict, List
from pymongo import MongoClient
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# MongoDB connection
client = MongoClient('mongodb+srv://sakshirpatel29062002:APVFDuw4CUvpQZBl@health-assitant.wm6oi.mongodb.net/', 
                     tls=True, 
                     tlsAllowInvalidCertificates=True)
db = client['Health']
disease_collection = db['disease']
medicine_collection = db['medicines']

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
                    medicine_names = [med["medicine_name"] for med in medicines if med]  # Added check to avoid NoneType error
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
            # Case-insensitive search for the medicine name
            query = {"medicine_name": {"$regex": f"^{selected_medicine}$", "$options": "i"}}
            medicine = medicine_collection.find_one(query)
            
            if medicine:
                dispatcher.utter_message(
                    text=f"The price of {medicine['medicine_name']} is {medicine['price']}. "
                         f"Description: {medicine['description']}."
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
            # Query MongoDB for the selected medicine using case-insensitive search
            query = {"medicine_name": {"$regex": f"^{selected_medicine}$", "$options": "i"}}
            medicine = medicine_collection.find_one(query)
            
            if medicine:
                # Check if the side_effects field exists and is populated
                if "side_effects" in medicine and medicine['side_effects']:
                    side_effects = ", ".join(medicine['side_effects'])
                    dispatcher.utter_message(
                        text=f"The side effects of {medicine['medicine_name']} are: {side_effects}."
                    )
                else:
                    dispatcher.utter_message(
                        text=f"Sorry, side effects for {medicine['medicine_name']} are not available."
                    )

                # Add Yes/No buttons for purchase confirmation
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

        if user_response == "yes":
            # Redirect user to the checkout page
            dispatcher.utter_message(text="Redirecting you to the checkout page...")
            dispatcher.utter_message(text="Please visit: [Checkout Page](http://your-react-app.com/checkout)")  # Replace with your React app's checkout URL
        else:
            # Thank the user and ask how else the bot can help
            dispatcher.utter_message(text="Thank you! How may I assist you further?")
        return []