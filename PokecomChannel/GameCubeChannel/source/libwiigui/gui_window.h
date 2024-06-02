#ifndef LIBWIIGUI_WINDOW_H
#define LIBWIIGUI_WINDOW_H

//!Allows GuiElements to be grouped together into a "window"
class GuiWindow : public GuiElement {
public:
	//!Constructor
	GuiWindow();
	//!\overload
	//!\param w Width of window
	//!\param h Height of window
	GuiWindow(int w, int h);
	//!Destructor
	~GuiWindow();
	//!Appends a GuiElement to the GuiWindow
	//!\param e The GuiElement to append. If it is already in the GuiWindow, it is removed first
	void Append(GuiElement* e);
	//!Inserts a GuiElement into the GuiWindow at the specified index
	//!\param e The GuiElement to insert. If it is already in the GuiWindow, it is removed first
	//!\param i Index in which to insert the element
	void Insert(GuiElement* e, u32 i);
	//!Removes the specified GuiElement from the GuiWindow
	//!\param e GuiElement to be removed
	void Remove(GuiElement* e);
	//!Removes all GuiElements
	void RemoveAll();
	//!Looks for the specified GuiElement
	//!\param e The GuiElement to find
	//!\return true if found, false otherwise
	bool Find(GuiElement* e);
	//!Returns the GuiElement at the specified index
	//!\param index The index of the element
	//!\return A pointer to the element at the index, nullptr on error (eg: out of bounds)
	GuiElement* GetGuiElementAt(u32 index) const;
	//!Returns the size of the list of elements
	//!\return The size of the current element list
	u32 GetSize();
	//!Sets the visibility of the window
	//!\param v visibility (true = visible)
	void SetVisible(bool v);
	//!Resets the window's state to STATE_DEFAULT
	void ResetState();
	//!Sets the window's state
	//!\param s State
	void SetState(STATE s);
	//!Gets the index of the GuiElement inside the window that is currently selected
	//!\return index of selected GuiElement
	int GetSelected();
	//!Sets the window focus
	//!\param f Focus
	void SetFocus(int f);
	//!Change the focus to the specified element
	//!This is intended for the primary GuiWindow only
	//!\param e GuiElement that should have focus
	void ChangeFocus(GuiElement * e);
	//!Changes window focus to the next focusable window or element
	//!If no element is in focus, changes focus to the first available element
	//!If B or 1 button is pressed, changes focus to the next available element
	//!This is intended for the primary GuiWindow only
	//!\param t Pointer to a GuiTrigger, containing the current input data from PAD/WPAD
	void ToggleFocus(GuiTrigger * t);
	//!Moves the selected element to the element to the left or right
	//!\param d Direction to move (-1 = left, 1 = right)
	void MoveSelectionHor(int d);
	//!Moves the selected element to the element above or below
	//!\param d Direction to move (-1 = up, 1 = down)
	void MoveSelectionVert(int d);
	//!Resets the text for all contained elements
	void ResetText();
	//!Draws all the elements in this GuiWindow
	void Draw();
	//!Draws all of the tooltips in this GuiWindow
	void DrawTooltip();
	//!Updates the window and all elements contains within
	//!Allows the GuiWindow and all elements to respond to the input data specified
	//!\param t Pointer to a GuiTrigger, containing the current input data from PAD/WPAD
	void Update(GuiTrigger * t);
protected:
	std::vector<GuiElement*> _elements; //!< Contains all elements within the GuiWindow
};

#endif
