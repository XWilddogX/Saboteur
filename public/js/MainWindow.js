function changePrincipal(seleccion) {
	switch(seleccion) {
		case 0: 
			window.location.href="/desconectar";
			break;
		case 1: 
			div = document.getElementById("principal")
			div.innerHTML='<object type="text/html" data="mainboard" style="width:100%; height: 100%;" ></object>';
			div.style.height = "750px"
			break;
		case 2: 
			div = document.getElementById("principal")
			div.innerHTML='<object type="text/html" data="unirse" style="width:100%; height: 100%;" ></object>';
			div.style.height = "750px";
			break;
		case 3: 
			div = document.getElementById("principal")
			div.innerHTML='<object type="text/html" data="crear.html" style="width:100%; height: 100%;" ></object>';
			div.style.height = "750px";
			break;
	}
	
}